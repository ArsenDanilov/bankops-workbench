// @vitest-environment node
import childProcess from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { passed, runCommand } from './lib/verification.ts';

let root: string;
beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'bankops-capture-test-'));
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  // Exact, uniquely-created test fixture; never a user-selected directory.
  if (
    path.dirname(root) !== os.tmpdir() ||
    !path.basename(root).startsWith('bankops-capture-test-')
  )
    throw new Error('Unsafe fixture cleanup');
  fs.rmSync(root, { recursive: true, force: true });
});

function run(
  script: string,
  options: { timeoutMs?: number; maxOutputBytes?: number } = {},
) {
  return runCommand(process.execPath, ['-e', script], root, 'node fixture', {
    capture: 'files',
    tempRoot: root,
    ...options,
  });
}
function expectClean() {
  expect(fs.readdirSync(root)).toEqual([]);
}

describe('file descriptor capture (Windows transport, exercised on every platform)', () => {
  it('captures both streams with no stdio pipes and preserves success', async () => {
    const spawn = vi.spyOn(childProcess, 'spawn');
    const result = await run(
      'console.log("stdout fixture"); console.error("stderr fixture")',
    );
    expect(result).toEqual({
      command: 'node fixture',
      exitCode: 0,
      stdout: 'stdout fixture\n',
      stderr: 'stderr fixture\n',
    });
    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      expect.any(Array),
      expect.objectContaining({
        stdio: ['ignore', expect.any(Number), expect.any(Number)],
        windowsHide: true,
      }),
    );
    expect(passed([result])).toBe(true);
    expectClean();
  });
  it('preserves numeric nonzero exit codes and diagnostic output', async () => {
    const result = await run(
      'console.log("out"); console.error("err"); process.exitCode=7',
    );
    expect(result).toMatchObject({
      exitCode: 7,
      stdout: 'out\n',
      stderr: 'err\n',
    });
    expect(passed([result])).toBe(false);
    expectClean();
  });
  it('returns executable-not-found as a structured failure and cleans files', async () => {
    const result = await runCommand(
      path.join(root, 'missing.exe'),
      [],
      root,
      'missing fixture',
      { capture: 'files', tempRoot: root },
    );
    expect(result.exitCode).toBeNull();
    expect(result.error).toContain('ENOENT');
    expectClean();
  });
  it('converts synchronous spawn failure into a result and cleans files', async () => {
    vi.spyOn(childProcess, 'spawn').mockImplementation(() => {
      throw new Error('spawn EPERM fixture');
    });
    await expect(run('')).resolves.toMatchObject({
      exitCode: null,
      error: 'spawn EPERM fixture',
    });
    expectClean();
  });
  it('cleans partial setup when opening stderr fails', async () => {
    const open = fs.openSync;
    vi.spyOn(fs, 'openSync').mockImplementation((...args) => {
      if (String(args[0]).endsWith('stderr'))
        throw new Error('fixture capture denied');
      return open(...args);
    });
    const result = await run('');
    expect(result.error).toContain('fixture capture denied');
    expectClean();
  });
  it('cleans both capture files if reading output fails', async () => {
    vi.spyOn(fs, 'readSync').mockImplementation(() => {
      throw new Error('fixture read failed');
    });
    const result = await run('console.log("output")');
    expect(result.error).toContain('fixture read failed');
    expect(passed([result])).toBe(false);
    expectClean();
  });
  it('attempts remaining cleanup and refuses success when descriptor cleanup reports an error', async () => {
    const close = fs.closeSync;
    vi.spyOn(fs, 'closeSync').mockImplementation((fd) => {
      close(fd);
      throw new Error('fixture close failure after release');
    });
    const result = await run('');
    expect(result.exitCode).toBe(0);
    expect(result.error).toContain('Capture close failed');
    expect(passed([result])).toBe(false);
    expectClean();
  });
  it('terminates on timeout, retains earlier output and cleans descriptors/files', async () => {
    const result = await run(
      'console.log("before timeout"); setInterval(() => {}, 1000)',
      { timeoutMs: 1000 },
    );
    expect(result.error).toContain('timed out');
    expect(result.stdout).toContain('before timeout');
    expect(passed([result])).toBe(false);
    expectClean();
  });
  it.each(['stdout', 'stderr'] as const)(
    'bounds %s and fails even if a short-lived child exits zero',
    async (stream) => {
      const result = await run(`process.${stream}.write('x'.repeat(4096))`, {
        maxOutputBytes: 128,
      });
      expect(result[stream].length).toBe(128);
      expect(result.error).toContain('Output exceeded');
      expect(passed([result])).toBe(false);
      expectClean();
    },
  );
  it('stops continuously growing output and cleans the capture', async () => {
    const result = await run(
      'setInterval(() => process.stdout.write("x".repeat(4096)), 5)',
      { maxOutputBytes: 128 },
    );
    expect(result.error).toContain('Output exceeded');
    expect(result.stdout.length).toBe(128);
    expectClean();
  });
  it('redacts captured output before returning it or logging it', async () => {
    vi.stubEnv('BANKOPS_TEST_SECRET', 'fixture-secret-value');
    const result = await run(
      'console.log("fixture-secret-value"); console.error("fixture-secret-value")',
    );
    expect(result.stdout).toBe('[REDACTED]\n');
    expect(result.stderr).toBe('[REDACTED]\n');
    expectClean();
    vi.unstubAllEnvs();
  });
});

describe('pipe transport and result contract', () => {
  it('keeps the execFile transport and defaults for non-Windows callers', async () => {
    const exec = vi.spyOn(childProcess, 'execFile').mockImplementation(((
      _file: unknown,
      _args: unknown,
      _options: unknown,
      callback: (error: null, stdout: string, stderr: string) => void,
    ) => {
      callback(null, 'pipe stdout', 'pipe stderr');
      return {};
    }) as typeof childProcess.execFile);
    const result = await runCommand('fixture', [], root, 'pipe fixture', {
      capture: 'pipes',
    });
    expect(result).toMatchObject({
      exitCode: 0,
      stdout: 'pipe stdout',
      stderr: 'pipe stderr',
    });
    expect(exec).toHaveBeenCalledWith(
      'fixture',
      [],
      expect.objectContaining({
        timeout: 600000,
        maxBuffer: 1048576,
        encoding: 'utf8',
      }),
      expect.any(Function),
    );
    expectClean();
  });
  it('converts synchronous execFile failure into a structured result', async () => {
    vi.spyOn(childProcess, 'execFile').mockImplementation(() => {
      throw new Error('execFile EPERM fixture');
    });
    await expect(
      runCommand('fixture', [], root, 'pipe fixture', { capture: 'pipes' }),
    ).resolves.toMatchObject({
      exitCode: null,
      error: 'execFile EPERM fixture',
    });
    expectClean();
  });
  it('does not pass a zero exit code with a capture/timeout error', () => {
    expect(
      passed([
        {
          command: 'fixture',
          exitCode: 0,
          stdout: '',
          stderr: '',
          error: 'capture failed',
        },
      ]),
    ).toBe(false);
  });
});
