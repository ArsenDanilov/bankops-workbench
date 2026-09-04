import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { safePath } from './task.ts';

export const QUALITY_SCRIPTS = ['lint', 'typecheck', 'test', 'build'] as const;
export type Script = { name: string; definition: string };
export type CommandResult = {
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
};
const COMMAND_TIMEOUT_MS = 10 * 60 * 1000;

export function detectScripts(root: string): Script[] {
  const manifest = JSON.parse(
    readFileSync(safePath(root, 'package.json'), 'utf8'),
  ) as { scripts?: Record<string, unknown> };
  const scripts = QUALITY_SCRIPTS.flatMap((name) => {
    const definition = manifest.scripts?.[name];
    return typeof definition === 'string' && definition.trim()
      ? [{ name, definition }]
      : [];
  });
  if (!scripts.length)
    throw new Error('No repository quality scripts are available');
  return scripts;
}

export function requireUnchangedScripts(
  root: string,
  expected: Script[],
): void {
  if (JSON.stringify(detectScripts(root)) !== JSON.stringify(expected)) {
    throw new Error(
      'Quality scripts changed during execution; human review required',
    );
  }
}

export function runCommand(
  executable: string,
  args: string[],
  cwd: string,
  command: string,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    execFile(
      executable,
      args,
      {
        cwd,
        windowsHide: true,
        timeout: COMMAND_TIMEOUT_MS,
        maxBuffer: 1024 * 1024,
        encoding: 'utf8',
      },
      (error, stdout, stderr) => {
        resolve({
          command,
          exitCode: error
            ? typeof error.code === 'number'
              ? error.code
              : null
            : 0,
          stdout,
          stderr: error ? `${stderr}\n${error.message}` : stderr,
        });
      },
    );
  });
}

export function passed(results: CommandResult[]): boolean {
  return results.length > 0 && results.every((result) => result.exitCode === 0);
}

export async function verify(
  root: string,
  npmCli: string,
  scripts: Script[],
  log: (value: unknown) => void,
): Promise<CommandResult[]> {
  requireUnchangedScripts(root, scripts);
  const results: CommandResult[] = [];
  for (const script of scripts) {
    const result = await runCommand(
      process.execPath,
      [npmCli, 'run', script.name],
      root,
      `npm run ${script.name}`,
    );
    log(result);
    console.log(
      `${result.command}: ${result.exitCode === 0 ? 'PASS' : `FAIL (${result.exitCode ?? 'process error'})`}`,
    );
    results.push(result);
  }
  return results;
}
