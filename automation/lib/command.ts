import childProcess from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeRedactor } from './log.ts';

export type CommandResult = {
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
};
const COMMAND_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_OUTPUT_BYTES = 1024 * 1024;
type CaptureOptions = {
  timeoutMs?: number;
  maxOutputBytes?: number;
  // Explicit transport/temp root seams for deterministic cross-platform tests.
  capture?: 'files' | 'pipes';
  tempRoot?: string;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runCommand(
  executable: string,
  args: string[],
  cwd: string,
  command: string,
  options: CaptureOptions = {},
): Promise<CommandResult> {
  const timeoutMs = options.timeoutMs ?? COMMAND_TIMEOUT_MS;
  const maxOutputBytes = options.maxOutputBytes ?? MAX_OUTPUT_BYTES;
  let result: CommandResult;
  try {
    if (
      !Number.isInteger(timeoutMs) ||
      timeoutMs <= 0 ||
      !Number.isInteger(maxOutputBytes) ||
      maxOutputBytes <= 0
    ) {
      throw new Error(
        'Capture timeout and output limit must be positive integers',
      );
    }
    const capture =
      options.capture ?? (process.platform === 'win32' ? 'files' : 'pipes');
    result =
      capture === 'files'
        ? await captureFiles(
            executable,
            args,
            cwd,
            command,
            timeoutMs,
            maxOutputBytes,
            options.tempRoot ?? os.tmpdir(),
          )
        : await capturePipes(
            executable,
            args,
            cwd,
            command,
            timeoutMs,
            maxOutputBytes,
          );
  } catch (error) {
    result = {
      command,
      exitCode: null,
      stdout: '',
      stderr: '',
      error: errorMessage(error),
    };
  }
  const redact = makeRedactor();
  return {
    ...result,
    command: redact(command),
    stdout: redact(result.stdout),
    stderr: redact(result.stderr),
    ...(result.error ? { error: redact(result.error) } : {}),
  };
}

function capturePipes(
  executable: string,
  args: string[],
  cwd: string,
  command: string,
  timeoutMs: number,
  maxOutputBytes: number,
): Promise<CommandResult> {
  return new Promise((resolve) => {
    childProcess.execFile(
      executable,
      args,
      {
        cwd,
        windowsHide: true,
        timeout: timeoutMs,
        maxBuffer: maxOutputBytes,
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
          ...(error ? { error: error.message } : {}),
        });
      },
    );
  });
}

async function captureFiles(
  executable: string,
  args: string[],
  cwd: string,
  command: string,
  timeoutMs: number,
  maxOutputBytes: number,
  tempRoot: string,
): Promise<CommandResult> {
  const result: CommandResult = {
    command,
    exitCode: null,
    stdout: '',
    stderr: '',
  };
  const descriptors: number[] = [];
  const files: string[] = [];
  let directory: string | undefined;
  const fail = (message: string) => {
    result.error = result.error ? `${result.error}; ${message}` : message;
  };
  try {
    directory = fs.mkdtempSync(path.join(tempRoot, 'bankops-verify-'));
    for (const stream of ['stdout', 'stderr']) {
      const filename = path.join(directory, stream);
      descriptors.push(fs.openSync(filename, 'wx+', 0o600));
      files.push(filename);
    }
    await new Promise<void>((resolve) => {
      // No shell, new stdio pipes, permission changes or discarded output.
      const child = childProcess.spawn(executable, args, {
        cwd,
        windowsHide: true,
        stdio: ['ignore', descriptors[0], descriptors[1]],
      });
      const stop = (message: string) => {
        if (result.error) return;
        fail(message);
        try {
          child.kill('SIGTERM');
        } catch (error) {
          fail(errorMessage(error));
        }
      };
      const timer = setTimeout(
        () => stop(`Command timed out after ${timeoutMs} ms`),
        timeoutMs,
      );
      // Files may grow between samples; reads/returned output remain hard-bounded.
      const monitor = setInterval(() => {
        try {
          if (descriptors.some((fd) => fs.fstatSync(fd).size > maxOutputBytes))
            stop(`Output exceeded ${maxOutputBytes} bytes per stream`);
        } catch (error) {
          stop(errorMessage(error));
        }
      }, 20);
      child.once('error', (error) => fail(errorMessage(error)));
      child.once('close', (code, signal) => {
        clearTimeout(timer);
        clearInterval(monitor);
        result.exitCode = child.pid === undefined ? null : code;
        if (signal && !result.error) fail(`Command terminated by ${signal}`);
        resolve();
      });
    });
    for (const [index, stream] of (['stdout', 'stderr'] as const).entries()) {
      const size = fs.fstatSync(descriptors[index]).size;
      if (size > maxOutputBytes && !result.error)
        fail(`Output exceeded ${maxOutputBytes} bytes per stream`);
      const buffer = Buffer.alloc(Math.min(size, maxOutputBytes));
      const bytes = fs.readSync(
        descriptors[index],
        buffer,
        0,
        buffer.length,
        0,
      );
      result[stream] = buffer.subarray(0, bytes).toString('utf8');
    }
  } catch (error) {
    fail(errorMessage(error));
  } finally {
    // Attempt every cleanup, including partial setup, launch errors and timeouts.
    // Only exact files/directories created by this invocation are removed.
    for (const fd of descriptors) {
      try {
        fs.closeSync(fd);
      } catch (error) {
        fail(`Capture close failed: ${errorMessage(error)}`);
      }
    }
    for (const filename of files) {
      try {
        fs.unlinkSync(filename);
      } catch (error) {
        fail(`Capture cleanup failed: ${errorMessage(error)}`);
      }
    }
    if (directory) {
      try {
        fs.rmdirSync(directory);
      } catch (error) {
        fail(`Capture cleanup failed: ${errorMessage(error)}`);
      }
    }
  }
  return result;
}

export function passed(results: CommandResult[]): boolean {
  return (
    results.length > 0 &&
    results.every((result) => result.exitCode === 0 && !result.error)
  );
}
