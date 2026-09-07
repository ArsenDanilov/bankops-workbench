import fs from 'node:fs';
import { safePath } from './task.ts';
import { passed, runCommand, type CommandResult } from './command.ts';
export { passed, runCommand, type CommandResult } from './command.ts';

export const QUALITY_SCRIPTS = ['lint', 'typecheck', 'test', 'build'] as const;
export type Script = { name: string; definition: string };

export function detectScripts(root: string): Script[] {
  const manifest = JSON.parse(
    fs.readFileSync(safePath(root, 'package.json'), 'utf8'),
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
      `${result.command}: ${passed([result]) ? 'PASS' : `FAIL (${result.exitCode ?? 'process error'}${result.error ? `; ${result.error}` : ''})`}`,
    );
    results.push(result);
  }
  return results;
}
