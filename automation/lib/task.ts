import { readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const TASK_PATH = 'docs/tasks/current.md';
export const STATUSES = [
  'READY',
  'IN_PROGRESS',
  'NEEDS_REVIEW',
  'BLOCKED',
  'ACCEPTED',
] as const;
export type Status = (typeof STATUSES)[number];
export type Task = { milestone: string; status: Status; report: string };

// Machine fields live above the first ## heading; examples below it are prose.
function field(source: string, label: string): string {
  const header = source.split(/^##\s/m)[0];
  const matches = [
    ...header.matchAll(new RegExp(`^${label}:[ \\t]*(.*)$`, 'gm')),
  ];
  if (matches.length !== 1)
    throw new Error(`Expected exactly one ${label} field`);
  const match = matches[0];
  const value =
    match[1].trim() ||
    header
      .slice(match.index! + match[0].length)
      .replace(/^\r?\n/, '')
      .split(/\r?\n/)[0]
      .trim();
  if (!value || value.includes(':')) throw new Error(`Invalid ${label} field`);
  return value;
}

export function parseTask(source: string): Task {
  const milestone = field(source, 'Current milestone');
  const status = field(source, 'Status') as Status;
  const report = field(source, 'Report');
  if (!STATUSES.includes(status))
    throw new Error(`Unknown task status: ${status}`);
  if (
    !/^docs\/reports\/[A-Za-z0-9][A-Za-z0-9._-]*\.md$/.test(report) ||
    /\/README\.md$/i.test(report)
  ) {
    throw new Error(
      'Report must name a milestone .md file directly under docs/reports/',
    );
  }
  return { milestone, status, report };
}

export function requireReady(task: Task): void {
  if (task.status !== 'READY')
    throw new Error(
      `Not executable: ${task.milestone} is ${task.status}; explicit READY required`,
    );
}

// Resolve existing ancestors too, so a missing report cannot escape via a symlink.
export function safePath(root: string, relative: string): string {
  const canonicalRoot = realpathSync(root);
  const target = path.resolve(canonicalRoot, relative);
  let ancestor = target;
  while (true) {
    try {
      const resolved = realpathSync(ancestor);
      const relation = path.relative(canonicalRoot, resolved);
      if (relation.startsWith('..') || path.isAbsolute(relation))
        throw new Error(`Path escapes repository: ${relative}`);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      const parent = path.dirname(ancestor);
      if (parent === ancestor) throw error;
      ancestor = parent;
    }
  }
  const relation = path.relative(canonicalRoot, target);
  if (relation.startsWith('..') || path.isAbsolute(relation))
    throw new Error(`Path escapes repository: ${relative}`);
  return target;
}

export function readTask(root: string): Task {
  return parseTask(readFileSync(safePath(root, TASK_PATH), 'utf8'));
}

export function requireSameTask(expected: Task, actual: Task): void {
  if (
    actual.milestone !== expected.milestone ||
    actual.report !== expected.report
  ) {
    throw new Error(
      'Current milestone/report identity changed; refusing to modify another task',
    );
  }
}

export function setStatus(
  root: string,
  expected: Task,
  status: Exclude<Status, 'ACCEPTED'>,
): void {
  const filename = safePath(root, TASK_PATH);
  const source = readFileSync(filename, 'utf8');
  const current = parseTask(source);
  requireSameTask(expected, current);
  if (current.status === 'ACCEPTED')
    throw new Error(
      'Unexpected ACCEPTED state; human investigation required, no overwrite',
    );
  const updated = source.replace(
    /^Status:[ \t]*(?:\r?\n[ \t]*)?[A-Z_]+[ \t]*\r?$/m,
    `Status: ${status}`,
  );
  if (parseTask(updated).status !== status)
    throw new Error('Task status could not be updated safely');
  writeFileSync(filename, updated);
}

export function validateFinal(root: string, expected: Task): void {
  const current = readTask(root);
  requireSameTask(expected, current);
  if (current.status !== 'NEEDS_REVIEW')
    throw new Error(
      `Final task status must be NEEDS_REVIEW, got ${current.status}`,
    );
  const report = safePath(root, expected.report);
  if (!statSync(report).isFile() || !readFileSync(report, 'utf8').trim())
    throw new Error('Expected nonempty milestone report');
}

export function recordBlock(
  root: string,
  task: Task,
  message: string,
  log: (value: unknown) => void,
): void {
  try {
    requireSameTask(task, readTask(root));
    setStatus(root, task, 'BLOCKED');
    const report = safePath(root, task.report);
    let existing = '';
    try {
      existing = readFileSync(report, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    writeFileSync(
      report,
      `${existing || `# ${task.milestone}\n\n## Status\n\nBLOCKED\n`}\n## Orchestrator stop\n\nTask is BLOCKED; human input required.\n\n${message}\n`,
    );
  } catch (error) {
    log({
      stateUpdateRefused:
        error instanceof Error ? error.message : String(error),
    });
  }
}
