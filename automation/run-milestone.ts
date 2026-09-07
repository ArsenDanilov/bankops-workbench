import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { prepareCodex, startAgent } from './lib/codex.ts';
import { resolveGitRoot } from './lib/git.ts';
import { createLog, makeRedactor } from './lib/log.ts';
import { orchestrate } from './lib/orchestrator.ts';
import {
  readTask,
  recordBlock,
  requireReady,
  requireSameTask,
  safePath,
  setStatus,
} from './lib/task.ts';
import { detectScripts, QUALITY_SCRIPTS, verify } from './lib/verification.ts';

const REQUIRED_FILES = [
  'AGENTS.md',
  'docs/tasks/current.md',
  'docs/product/product-spec.md',
  'docs/visual/visual-system.md',
  'docs/visual/review-queue.md',
  'docs/architecture/architecture-decisions.md',
  'docs/reports/README.md',
];

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--dry-run') || args.length > 1)
    throw new Error('Usage: npm run agent:run -- [--dry-run]');
  if (Number(process.versions.node.split('.')[0]) !== 24)
    throw new Error(
      'Node 24 required; switch Node version before running agent:run',
    );
  const root = realpathSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  );
  await resolveGitRoot(root);
  for (const filename of REQUIRED_FILES) {
    if (!readFileSync(safePath(root, filename), 'utf8').trim())
      throw new Error(`Empty required document: ${filename}`);
  }
  const task = readTask(root);
  safePath(root, task.report);
  const scripts = detectScripts(root);
  const npmCli = process.env.npm_execpath;
  if (!npmCli || !statSync(npmCli).isFile())
    throw new Error('Run through npm run agent:run (npm CLI path required)');
  console.log(
    `Milestone: ${task.milestone}\nState: ${task.status}\nReport: ${task.report}`,
  );
  console.log(
    `Verification: ${scripts.map((script) => script.name).join(' → ')}`,
  );
  const missing = QUALITY_SCRIPTS.filter(
    (name) => !scripts.some((script) => script.name === name),
  );
  if (missing.length)
    console.log(`Absent scripts (not run): ${missing.join(', ')}`);
  // Preflight does not change project state; transient Git captures are cleaned.
  const codex = prepareCodex();
  console.log(
    'SDK/runtime resolved. Authentication is not contacted by dry-run; use codex login status separately.',
  );
  requireReady(task);
  if (args.includes('--dry-run')) {
    console.log(
      'Dry-run PASS: READY; no Codex invocation, state changes or runtime logs.',
    );
    return;
  }

  const runtime = safePath(root, '.bankops-agent');
  mkdirSync(runtime, { recursive: true });
  const lockPath = safePath(root, '.bankops-agent/active.lock');
  const lock = openSync(lockPath, 'wx', 0o600); // Never steal a live or stale lock.
  let active = false;
  let log: (value: unknown) => void = () => {};
  const redact = makeRedactor();
  try {
    writeFileSync(
      lock,
      JSON.stringify({ pid: process.pid, started: new Date().toISOString() }),
    );
    const logPath = safePath(
      root,
      `.bankops-agent/${new Date().toISOString().replaceAll(':', '-')}-${randomUUID()}.jsonl`,
    );
    log = createLog(logPath, redact);
    console.log(`Runtime log: ${path.relative(root, logPath)}`);
    const fresh = readTask(root);
    requireSameTask(task, fresh);
    requireReady(fresh);
    setStatus(root, task, 'IN_PROGRESS');
    active = true;
    log({ milestone: task.milestone, status: 'IN_PROGRESS', scripts });
    await orchestrate({
      root,
      task,
      agent: startAgent(codex, root),
      verify: () => verify(root, npmCli, scripts, log),
      log,
      redact,
    });
    log({ status: 'NEEDS_REVIEW' });
    console.log(
      'NEEDS_REVIEW: verification and report/state checks passed. Human acceptance required.',
    );
  } catch (error) {
    const message = redact(
      error instanceof Error ? error.message : String(error),
    );
    log({ status: 'BLOCKED', error: message });
    if (active) recordBlock(root, task, message, log);
    throw new Error(message, { cause: error });
  } finally {
    closeSync(lock);
    unlinkSync(lockPath);
  }
}

main().catch((error: unknown) => {
  console.error(
    makeRedactor()(error instanceof Error ? error.message : String(error)),
  );
  process.exitCode = 1;
});
