import { realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { passed, runCommand } from './command.ts';

// A real Git query remains mandatory; filesystem presence is not a fallback.
export async function resolveGitRoot(
  root: string,
  execute: typeof runCommand = runCommand,
): Promise<string> {
  // Native canonicalization also expands Windows 8.3 aliases (e.g. TEMP paths).
  const canonicalRoot = realpathSync.native(root);
  if (!statSync(canonicalRoot).isDirectory())
    throw new Error('Runner root must be a directory');
  const result = await execute(
    'git',
    ['rev-parse', '--show-toplevel'],
    canonicalRoot,
    'git rev-parse --show-toplevel',
    { timeoutMs: 30000, maxOutputBytes: 64 * 1024 },
  );
  if (!passed([result])) {
    throw new Error(
      `Git preflight failed (exit ${result.exitCode ?? 'launch error'}): ${result.error ?? ''}\n${result.stderr}\n${result.stdout}`,
    );
  }
  // Remove only the terminal newline: spaces may be part of a valid path.
  const output = result.stdout.replace(/\r?\n$/, '');
  if (!output || /[\r\n\0]/.test(output) || !path.isAbsolute(output))
    throw new Error('Git preflight returned an invalid root path');
  const gitRoot = realpathSync.native(output);
  if (!statSync(gitRoot).isDirectory())
    throw new Error('Git preflight root must be a directory');
  if (canonicalRoot !== gitRoot)
    throw new Error('Runner must live at this Git repository root');
  return gitRoot;
}
