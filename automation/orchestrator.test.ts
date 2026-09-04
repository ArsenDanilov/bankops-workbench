// @vitest-environment node
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseOutcome } from './lib/codex.ts';
import type { Agent, Outcome } from './lib/codex.ts';
import { createLog, makeRedactor } from './lib/log.ts';
import { MAX_REPAIR_ATTEMPTS, orchestrate } from './lib/orchestrator.ts';
import {
  parseTask,
  readTask,
  recordBlock,
  requireReady,
  safePath,
  setStatus,
  STATUSES,
  validateFinal,
} from './lib/task.ts';
import type { Status, Task } from './lib/task.ts';
import {
  detectScripts,
  passed,
  requireUnchangedScripts,
  runCommand,
  verify,
} from './lib/verification.ts';
import type { CommandResult } from './lib/verification.ts';

const temporaryRoots: string[] = [];
const task: Task = {
  milestone: 'M-TEST — Local fixture',
  status: 'READY',
  report: 'docs/reports/M-TEST.md',
};
function taskText(status: Status = 'READY'): string {
  return `# Current task\n\nCurrent milestone:\n${task.milestone}\n\nStatus:\n${status}\n\nReport:\n${task.report}\n\n## Scope\nOnly a test fixture.\n`;
}
function fixture(status: Status = 'IN_PROGRESS'): string {
  const root = mkdtempSync(
    path.join(os.tmpdir(), 'bankops-orchestrator-test-'),
  );
  temporaryRoots.push(root);
  mkdirSync(path.join(root, 'docs/tasks'), { recursive: true });
  mkdirSync(path.join(root, 'docs/reports'), { recursive: true });
  writeFileSync(path.join(root, 'docs/tasks/current.md'), taskText(status));
  writeFileSync(
    path.join(root, 'package.json'),
    JSON.stringify({
      scripts: { lint: 'eslint .', test: 'vitest run', dev: 'vite' },
    }),
  );
  return root;
}
afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    // Only exact directories created by this test process are removed.
    if (
      path.dirname(root) !== os.tmpdir() ||
      !path.basename(root).startsWith('bankops-orchestrator-test-')
    )
      throw new Error('Unsafe fixture cleanup');
    rmSync(root, { recursive: true, force: true });
  }
});

function finish(root: string): Outcome {
  setStatus(root, task, 'NEEDS_REVIEW');
  writeFileSync(
    path.join(root, task.report),
    '# Fixture report\n\nNEEDS_REVIEW\n',
  );
  return {
    status: 'NEEDS_REVIEW',
    humanGate: false,
    summary: 'Fixture complete',
  };
}
function result(exitCode: number | null = 0): CommandResult {
  return {
    command: 'npm run test',
    exitCode,
    stdout: 'test output',
    stderr: exitCode === 0 ? '' : 'fixture failure',
  };
}
function setup(
  root: string,
  implementation: (prompt: string) => Promise<Outcome> = async () =>
    finish(root),
) {
  const run = vi.fn(implementation);
  const agent: Agent = { run, id: () => 'fake-thread-one' };
  const check = vi.fn(async () => [result()]);
  const log = vi.fn();
  return {
    root,
    task,
    agent,
    verify: check,
    log,
    redact: makeRedactor({}),
    run,
  };
}

describe('task contract', () => {
  it('parses multiline and inline fields, including CRLF', () => {
    expect(parseTask(taskText())).toEqual(task);
    expect(
      parseTask(
        taskText()
          .replace('Status:\nREADY', 'Status: READY')
          .replaceAll('\n', '\r\n'),
      ),
    ).toEqual(task);
  });
  it('ignores lifecycle examples beneath the machine header', () => {
    expect(parseTask(`${taskText()}\nStatus: ACCEPTED\n`)).toEqual(task);
  });
  it.each([
    taskText().replace('Status:\nREADY', 'Status: UNKNOWN'),
    taskText().replace('Status:\nREADY', 'Status: READY\nStatus: READY'),
    taskText().replace('Current milestone:', 'Other field:'),
    taskText().replace('Status:\nREADY', 'Status:\n\nREADY'),
    taskText().replace(task.report, 'docs/reports/../secret.md'),
    taskText().replace(task.report, 'C:/outside.md'),
    taskText().replace(task.report, 'docs/reports/README.md'),
  ])('rejects malformed/ambiguous task metadata', (text) => {
    expect(() => parseTask(text)).toThrow();
  });
  it.each(STATUSES.filter((status) => status !== 'READY'))(
    'refuses %s before invoking an agent',
    async (status) => {
      const options = setup(fixture(status));
      await expect(
        orchestrate({ ...options, task: { ...task, status } }),
      ).rejects.toThrow('explicit READY');
      expect(options.run).not.toHaveBeenCalled();
      expect(options.verify).not.toHaveBeenCalled();
      expect(options.log).not.toHaveBeenCalled();
    },
  );
  it('allows only explicitly READY', () =>
    expect(() => requireReady(task)).not.toThrow());
  it('changes only Status and refuses overwriting ACCEPTED or another milestone', () => {
    const root = fixture('READY');
    setStatus(root, task, 'IN_PROGRESS');
    expect(readTask(root).status).toBe('IN_PROGRESS');
    expect(readFileSync(path.join(root, 'docs/tasks/current.md'), 'utf8')).toBe(
      taskText().replace('Status:\nREADY', 'Status: IN_PROGRESS'),
    );
    writeFileSync(
      path.join(root, 'docs/tasks/current.md'),
      taskText('ACCEPTED'),
    );
    expect(() => setStatus(root, task, 'BLOCKED')).toThrow('no overwrite');
    writeFileSync(
      path.join(root, 'docs/tasks/current.md'),
      taskText().replace(task.milestone, 'M-OTHER'),
    );
    expect(() => setStatus(root, task, 'BLOCKED')).toThrow('identity');
  });
  it('rejects paths outside the repository, including missing descendants', () => {
    const root = fixture();
    expect(() => safePath(root, '../outside/missing')).toThrow('escapes');
  });
});

describe('bounded same-thread orchestration', () => {
  it('succeeds only after agent, independent verification and final contract', async () => {
    const options = setup(fixture());
    await orchestrate(options);
    expect(options.run).toHaveBeenCalledOnce();
    expect(options.verify).toHaveBeenCalledOnce();
    expect(options.log).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: 'fake-thread-one' }),
    );
    expect(readTask(options.root).status).toBe('NEEDS_REVIEW');
  });
  it('passes redacted failures into the same agent then repeats verification', async () => {
    const options = setup(fixture());
    options.verify.mockResolvedValueOnce([
      { ...result(1), stderr: 'TEST_TOKEN_VALUE' },
    ]);
    await orchestrate({
      ...options,
      redact: makeRedactor({ API_TOKEN: 'TEST_TOKEN_VALUE' }),
    });
    expect(options.run).toHaveBeenCalledTimes(2);
    expect(options.verify).toHaveBeenCalledTimes(2);
    expect(options.run.mock.calls[1]).toEqual([
      expect.stringContaining('[REDACTED]'),
    ]);
    expect(options.run.mock.calls[1]).toEqual([
      expect.not.stringContaining('TEST_TOKEN_VALUE'),
    ]);
  });
  it('stops after initial turn plus exactly three repairs', async () => {
    const options = setup(fixture());
    options.verify.mockResolvedValue([result(1)]);
    await expect(orchestrate(options)).rejects.toThrow('after 3 repairs');
    expect(options.run).toHaveBeenCalledTimes(MAX_REPAIR_ATTEMPTS + 1);
    expect(options.verify).toHaveBeenCalledTimes(MAX_REPAIR_ATTEMPTS + 1);
  });
  it('can succeed on the last allowed repair', async () => {
    const options = setup(fixture());
    options.verify
      .mockResolvedValueOnce([result(1)])
      .mockResolvedValueOnce([result(1)])
      .mockResolvedValueOnce([result(1)]);
    await orchestrate(options);
    expect(options.run).toHaveBeenCalledTimes(4);
  });
  it.each([true, false])(
    'stops on a reported gate/BLOCKED with no verification or repair (%s)',
    async (humanGate) => {
      const root = fixture();
      const options = setup(
        root,
        vi.fn(async () => ({
          status: 'BLOCKED' as const,
          humanGate,
          summary: 'Approval needed',
        })),
      );
      await expect(orchestrate(options)).rejects.toThrow(
        'Human input required',
      );
      expect(options.verify).not.toHaveBeenCalled();
      expect(options.run).toHaveBeenCalledOnce();
    },
  );
  it('also respects a BLOCKED task even if the response claims success', async () => {
    const root = fixture();
    const options = setup(
      root,
      vi.fn(async () => {
        const outcome = finish(root);
        setStatus(root, task, 'BLOCKED');
        return outcome;
      }),
    );
    await expect(orchestrate(options)).rejects.toThrow('Human input');
    expect(options.verify).not.toHaveBeenCalled();
  });
  it('flags self-acceptance and never overwrites it', async () => {
    const root = fixture();
    const options = setup(
      root,
      vi.fn(async () => {
        writeFileSync(
          path.join(root, 'docs/tasks/current.md'),
          taskText('ACCEPTED'),
        );
        return {
          status: 'NEEDS_REVIEW' as const,
          humanGate: false,
          summary: 'Bad agent',
        };
      }),
    );
    await expect(orchestrate(options)).rejects.toThrow('self-ACCEPTED');
    expect(options.verify).not.toHaveBeenCalled();
    expect(readTask(root).status).toBe('ACCEPTED');
  });
  it('does not retry SDK execution/auth failures', async () => {
    const options = setup(
      fixture(),
      vi.fn(async () => {
        throw new Error('Authentication needed');
      }),
    );
    await expect(orchestrate(options)).rejects.toThrow('Authentication needed');
    expect(options.run).toHaveBeenCalledOnce();
    expect(options.verify).not.toHaveBeenCalled();
  });
  it('fails instead of repairing an invalid final report', async () => {
    const root = fixture();
    const options = setup(
      root,
      vi.fn(async () => {
        setStatus(root, task, 'NEEDS_REVIEW');
        return {
          status: 'NEEDS_REVIEW' as const,
          humanGate: false,
          summary: 'Missing report',
        };
      }),
    );
    await expect(orchestrate(options)).rejects.toThrow();
    expect(options.run).toHaveBeenCalledOnce();
    expect(options.verify).toHaveBeenCalledOnce();
  });
});

describe('final validation and structured SDK boundary', () => {
  it('records failed execution as BLOCKED, preserving existing report content', () => {
    const root = fixture();
    finish(root);
    recordBlock(root, task, 'Verification exhausted', vi.fn());
    expect(readTask(root).status).toBe('BLOCKED');
    const report = readFileSync(path.join(root, task.report), 'utf8');
    expect(report).toContain('# Fixture report');
    expect(report).toContain('Task is BLOCKED');
    expect(report).toContain('Verification exhausted');
  });
  it('creates a minimal blocked report if the implementation never produced one', () => {
    const root = fixture();
    recordBlock(root, task, 'Authentication required', vi.fn());
    expect(readTask(root).status).toBe('BLOCKED');
    expect(readFileSync(path.join(root, task.report), 'utf8')).toContain(
      '## Status\n\nBLOCKED',
    );
  });
  it.each(['ACCEPTED', 'different milestone', 'malformed'])(
    'preserves conflicting %s metadata and logs the refusal',
    (kind) => {
      const root = fixture();
      const source =
        kind === 'ACCEPTED'
          ? taskText('ACCEPTED')
          : kind === 'malformed'
            ? 'invalid task'
            : taskText().replace(task.milestone, 'M-OTHER');
      writeFileSync(path.join(root, 'docs/tasks/current.md'), source);
      const log = vi.fn();
      recordBlock(root, task, 'Failed turn', log);
      expect(
        readFileSync(path.join(root, 'docs/tasks/current.md'), 'utf8'),
      ).toBe(source);
      expect(log).toHaveBeenCalledWith(
        expect.objectContaining({ stateUpdateRefused: expect.any(String) }),
      );
    },
  );
  it('requires report, same milestone/report identity and NEEDS_REVIEW', () => {
    const root = fixture();
    expect(() => validateFinal(root, task)).toThrow('NEEDS_REVIEW');
    finish(root);
    expect(() => validateFinal(root, task)).not.toThrow();
    writeFileSync(path.join(root, task.report), '  ');
    expect(() => validateFinal(root, task)).toThrow('nonempty');
    writeFileSync(
      path.join(root, 'docs/tasks/current.md'),
      taskText('NEEDS_REVIEW').replace(task.report, 'docs/reports/OTHER.md'),
    );
    expect(() => validateFinal(root, task)).toThrow('identity');
  });
  it.each([
    'not json',
    '{}',
    'null',
    '{"status":"ACCEPTED","humanGate":false,"summary":"no"}',
  ])('rejects malformed or self-accepted SDK output', (value) => {
    expect(() => parseOutcome(value)).toThrow();
  });
  it('accepts the explicit Human Gate signal', () => {
    expect(
      parseOutcome(
        '{"status":"BLOCKED","humanGate":true,"summary":"Decision needed"}',
      ).humanGate,
    ).toBe(true);
  });
});

describe('independent verification', () => {
  it('detects only available quality scripts, in fixed order; refuses changes/removal', () => {
    const root = fixture();
    const scripts = detectScripts(root);
    expect(scripts.map((script) => script.name)).toEqual(['lint', 'test']);
    requireUnchangedScripts(root, scripts);
    writeFileSync(
      path.join(root, 'package.json'),
      '{"scripts":{"test":"echo passed"}}',
    );
    expect(() => requireUnchangedScripts(root, scripts)).toThrow('changed');
    writeFileSync(path.join(root, 'package.json'), '{}');
    expect(() => detectScripts(root)).toThrow('No repository quality scripts');
  });
  it('does not treat null exit codes or empty verification as success', () => {
    expect(passed([])).toBe(false);
    expect(passed([result(null)])).toBe(false);
    expect(passed([result(), result(1)])).toBe(false);
    expect(passed([result(), result()])).toBe(true);
  });
  it('captures stdout, stderr and numeric failure code from a real local process', async () => {
    const output = await runCommand(
      process.execPath,
      [
        '-e',
        'console.log("output"); console.error("diagnostic"); process.exitCode=7',
      ],
      fixture(),
      'fixture command',
    );
    expect(output).toMatchObject({
      command: 'fixture command',
      exitCode: 7,
      stdout: expect.stringContaining('output'),
      stderr: expect.stringContaining('diagnostic'),
    });
  });
  it('returns process-start errors as failure', async () => {
    expect(
      (
        await runCommand(
          path.join(fixture(), 'missing-executable'),
          [],
          os.tmpdir(),
          'missing',
        )
      ).exitCode,
    ).toBeNull();
  });
  it('runs every available script despite an earlier failure and logs each result', async () => {
    const root = fixture();
    const npmFixture = path.join(root, 'fake-npm.cjs');
    writeFileSync(
      npmFixture,
      'console.log(process.argv[3]); process.exitCode = process.argv[3] === "lint" ? 2 : 0;',
    );
    const log = vi.fn();
    const results = await verify(root, npmFixture, detectScripts(root), log);
    expect(results.map(({ command, exitCode }) => [command, exitCode])).toEqual(
      [
        ['npm run lint', 2],
        ['npm run test', 0],
      ],
    );
    expect(log).toHaveBeenCalledTimes(2);
  });
});

describe('runtime log hygiene', () => {
  it('redacts known environment secrets before JSON escaping, and recognizable credential formats', () => {
    const root = fixture();
    const filename = path.join(root, 'run.jsonl');
    const secret = 'local"fixture\\secret';
    const redact = makeRedactor({ SERVICE_TOKEN: secret });
    createLog(
      filename,
      redact,
    )({
      stdout: `${secret} Bearer example-token sk-test-fixture password=example`,
    });
    const text = readFileSync(filename, 'utf8');
    expect(text).not.toContain('fixture');
    expect(text).not.toContain('example');
    expect(text).toContain('[REDACTED]');
  });
});
