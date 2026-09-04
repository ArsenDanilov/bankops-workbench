import { Codex } from '@openai/codex-sdk';
import { accessSync, constants } from 'node:fs';
import path from 'node:path';
import type { Task } from './task.ts';

export type Outcome = {
  status: 'NEEDS_REVIEW' | 'BLOCKED';
  humanGate: boolean;
  summary: string;
};
export type Agent = {
  run: (prompt: string) => Promise<Outcome>;
  id: () => string | null;
};
const TURN_TIMEOUT_MS = 60 * 60 * 1000;
const outcomeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'humanGate', 'summary'],
  properties: {
    status: { type: 'string', enum: ['NEEDS_REVIEW', 'BLOCKED'] },
    humanGate: { type: 'boolean' },
    summary: { type: 'string' },
  },
};

export function parseOutcome(response: string): Outcome {
  const value: unknown = JSON.parse(response);
  if (!value || typeof value !== 'object')
    throw new Error('Invalid Codex outcome');
  const outcome = value as Partial<Outcome>;
  if (
    (outcome.status !== 'NEEDS_REVIEW' && outcome.status !== 'BLOCKED') ||
    typeof outcome.humanGate !== 'boolean' ||
    typeof outcome.summary !== 'string'
  ) {
    throw new Error('Invalid Codex outcome; self-ACCEPTED is forbidden');
  }
  return outcome as Outcome;
}

// Construction only resolves the SDK/runtime. It launches no CLI or service turn.
export function prepareCodex(): Codex {
  const override = process.env.BANKOPS_CODEX_PATH;
  if (override) {
    if (!path.isAbsolute(override))
      throw new Error(
        'BANKOPS_CODEX_PATH must be an absolute native Codex executable path',
      );
    accessSync(override, constants.X_OK);
  }
  return new Codex(override ? { codexPathOverride: override } : {});
}

export function startAgent(codex: Codex, root: string): Agent {
  const thread = codex.startThread({
    workingDirectory: root,
    sandboxMode: 'workspace-write',
    approvalPolicy: 'never',
    networkAccessEnabled: false,
    webSearchMode: 'disabled',
  });
  return {
    id: () => thread.id,
    run: async (prompt) =>
      parseOutcome(
        (
          await thread.run(prompt, {
            outputSchema: outcomeSchema,
            signal: AbortSignal.timeout(TURN_TIMEOUT_MS),
          })
        ).finalResponse,
      ),
  };
}

export function initialPrompt(task: Task): string {
  return `Execute only the approved milestone ${JSON.stringify(task.milestone)} in this repository.
Read AGENTS.md, docs/tasks/current.md and every source-of-truth document referenced by that task before implementation. Repository documents govern scope; inspect existing implementation and preserve unrelated work.
The runner has changed READY to IN_PROGRESS. Complete the approved milestone autonomously, perform its own required verification, and write the report at ${task.report}. Never choose backlog work or call agent:run recursively. Do not commit, push, merge, publish or deploy. Do not modify automation code or quality-script definitions to bypass checks.
Respect Human Gates. If blocked by a missing decision, permission, authentication or an unapproved dependency, STOP immediately, write the reason in task/report, set BLOCKED and return humanGate=true. Do not work around a gate.
Otherwise finish docs/tasks/current.md at NEEDS_REVIEW, retaining the milestone and Report fields. Never set ACCEPTED. Return the structured status, humanGate and concise summary; omit credentials and sensitive content. Do not read or print authentication files, environment secrets or credentials.`;
}
