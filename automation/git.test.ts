// @vitest-environment node
import childProcess from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runCommand, type CommandResult } from './lib/command.ts';
import { resolveGitRoot } from './lib/git.ts';

let fixture: string;
let root: string;
let capture: string;
beforeEach(() => {
  fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'bankops-git-test-'));
  root = path.join(fixture, 'repository with spaces');
  capture = path.join(fixture, 'capture');
  fs.mkdirSync(root);
  fs.mkdirSync(capture);
});
afterEach(() => {
  vi.restoreAllMocks();
  if (
    path.dirname(fixture) !== os.tmpdir() ||
    !path.basename(fixture).startsWith('bankops-git-test-')
  )
    throw new Error('Unsafe fixture cleanup');
  fs.rmSync(fixture, { recursive: true, force: true });
});

const files: typeof runCommand = (exe, args, cwd, label, options) =>
  runCommand(exe, args, cwd, label, {
    ...options,
    capture: 'files',
    tempRoot: capture,
  });

async function init() {
  const result = await files(
    'git',
    ['init', '--quiet'],
    root,
    'git init fixture',
  );
  expect(result.exitCode).toBe(0);
  expect(result.error).toBeUndefined();
}

function reply(overrides: Partial<CommandResult> = {}) {
  return vi.fn<typeof runCommand>().mockResolvedValue({
    command: 'git rev-parse --show-toplevel',
    exitCode: 0,
    stdout: `${root}\r\n`,
    stderr: '',
    ...overrides,
  });
}

describe('real Git preflight with shared Windows-safe capture', () => {
  it('resolves a real repository through file descriptors and cleans capture', async () => {
    await init();
    const spawn = vi.spyOn(childProcess, 'spawn');
    await expect(resolveGitRoot(root, files)).resolves.toBe(
      fs.realpathSync.native(root),
    );
    expect(spawn).toHaveBeenCalledWith(
      'git',
      ['rev-parse', '--show-toplevel'],
      expect.objectContaining({
        cwd: fs.realpathSync.native(root),
        stdio: ['ignore', expect.any(Number), expect.any(Number)],
      }),
    );
    expect(fs.readdirSync(capture)).toEqual([]);
  });
  it('uses the platform-default transport without a production override', async () => {
    await init();
    const spawn = vi.spyOn(childProcess, 'spawn');
    const exec = vi.spyOn(childProcess, 'execFile');
    await expect(resolveGitRoot(root)).resolves.toBe(fs.realpathSync.native(root));
    expect(process.platform === 'win32' ? spawn : exec).toHaveBeenCalled();
    expect(process.platform === 'win32' ? exec : spawn).not.toHaveBeenCalled();
  });
  it('refuses a nested runner even inside a valid repository', async () => {
    await init();
    const nested = path.join(root, 'nested');
    fs.mkdirSync(nested);
    await expect(resolveGitRoot(nested, files)).rejects.toThrow(
      'repository root',
    );
    expect(fs.readdirSync(capture)).toEqual([]);
  });
  it.each([false, true])(
    'refuses a non-repository (fake .git: %s)',
    async (fake) => {
      if (fake) fs.mkdirSync(path.join(root, '.git'));
      await expect(resolveGitRoot(root, files)).rejects.toThrow(
        'Git preflight failed',
      );
      expect(fs.readdirSync(capture)).toEqual([]);
    },
  );
  it('fails closed on synchronous launch failure and cleans capture', async () => {
    vi.spyOn(childProcess, 'spawn').mockImplementation(() => {
      throw new Error('spawn EPERM fixture');
    });
    await expect(resolveGitRoot(root, files)).rejects.toThrow(
      'spawn EPERM fixture',
    );
    expect(fs.readdirSync(capture)).toEqual([]);
  });
  it('fails closed on executable-not-found and cleans capture', async () => {
    const missing: typeof runCommand = (_exe, args, cwd, label, options) =>
      files(path.join(fixture, 'missing-git.exe'), args, cwd, label, options);
    await expect(resolveGitRoot(root, missing)).rejects.toThrow('ENOENT');
    expect(fs.readdirSync(capture)).toEqual([]);
  });
});

describe('Git result validation', () => {
  it('accepts CRLF and spaces, and imposes timeout and bounded output', async () => {
    const execute = reply();
    await expect(resolveGitRoot(root, execute)).resolves.toBe(
      fs.realpathSync.native(root),
    );
    expect(execute).toHaveBeenCalledWith(
      'git',
      ['rev-parse', '--show-toplevel'],
      fs.realpathSync.native(root),
      'git rev-parse --show-toplevel',
      { timeoutMs: 30000, maxOutputBytes: 65536 },
    );
  });
  it.each([
    { exitCode: 128, stderr: 'fatal: not a git repository' },
    { exitCode: null, error: 'spawn git ENOENT' },
    { exitCode: 0, error: 'Capture cleanup failed' },
  ])(
    'refuses failed results even with plausible stdout: %j',
    async (failure) => {
      await expect(resolveGitRoot(root, reply(failure))).rejects.toThrow(
        'Git preflight failed',
      );
    },
  );
  it.each(['', '\n', 'relative/path\n', 'one\ntwo\n', 'bad\0path'])(
    'rejects malformed output %j',
    async (stdout) => {
      await expect(resolveGitRoot(root, reply({ stdout }))).rejects.toThrow(
        'invalid root path',
      );
    },
  );
  it('rejects multiple absolute output lines', async () => {
    await expect(
      resolveGitRoot(root, reply({ stdout: `${root}\n${root}\n` })),
    ).rejects.toThrow('invalid root path');
  });
  it('rejects an existing but different root', async () => {
    await expect(
      resolveGitRoot(root, reply({ stdout: fixture })),
    ).rejects.toThrow('repository root');
  });
  it('rejects a nonexistent root', async () => {
    await expect(
      resolveGitRoot(root, reply({ stdout: path.join(fixture, 'missing') })),
    ).rejects.toThrow();
  });
  it('rejects a file in place of a directory', async () => {
    const filename = path.join(fixture, 'not-a-directory');
    fs.writeFileSync(filename, 'fixture');
    await expect(
      resolveGitRoot(root, reply({ stdout: filename })),
    ).rejects.toThrow('directory');
    const execute = reply();
    await expect(resolveGitRoot(filename, execute)).rejects.toThrow(
      'directory',
    );
    expect(execute).not.toHaveBeenCalled();
  });
});
