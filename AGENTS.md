# BankOps Workbench — Development Contract

## Project

BankOps Workbench is a React/TypeScript internal antifraud review application.
Baseline: React 19.2, strict TypeScript, Vite 8, React Router v7 Declarative Mode,
CSS Modules, CSS custom properties, npm and semantic HTML. Queue search, filters
and page are URL-owned. Data currently comes from local typed fixtures; there is
no global client state store.

## Start each milestone

1. Read this contract and any applicable nearest `AGENTS.md` or
   `AGENTS.override.md` before editing.
2. Read [the current task](docs/tasks/current.md). Implement only its approved
   scope; the [backlog](docs/tasks/backlog.md) is not authorization to start work.
3. Inspect Git status, the current branch and relevant repository structure.
4. Search first, then read only Product, Visual and Architecture sections
   referenced by the current task. Historical reports are audit records, not
   normal implementation source of truth; read one only for an otherwise-missing
   implementation detail, regression, known issue or explicitly referenced fact.
5. Inspect directly affected code and tests. Preserve useful documentation and
   unrelated user changes. If approved sources conflict or lack a decision
   necessary for implementation, report it instead of inventing a requirement.
6. Apply Ponytail proportionately. Use `complexity-router` or Code Review Graph
   only when a shared abstraction has broad unknown impact, ordinary static search
   is insufficient, or the task explicitly requires deeper dependency analysis.
7. Form a compact working capsule: goal, scope, invariants, Human Gates, likely
   files, affected tests, browser scenarios and explicit exclusions. Keep it in
   working context rather than another document.
8. Implement the smallest scoped change, verify it, and write a report using
   [the report contract](docs/reports/README.md).
9. Set the current task to `NEEDS_REVIEW` when implementation is ready for human
   review. Only a human may accept it; never set `ACCEPTED` autonomously.

## Efficient execution protocol

- Source priority: this contract → current task → Product → Visual → Architecture
  → implementation/tests → historical reports.
- Explore with `rg`/symbol search, then narrow ranges. Do not print large files,
  diffs, DOM/accessibility trees or successful logs without a diagnostic reason.
  Do not reread unchanged source of truth in the same milestone.
- Before application edits, validate supplied data/contracts: count, uniqueness,
  order, time window, IDs, aggregates, inclusion rules, snapshot identity and
  API/UI compatibility. Stop early at a Human Gate for conflict or missing input.
- Implement vertical slices: types/fixture/API → query → rendering/states →
  interaction/accessibility → integration. Verification is diff-driven, not a
  checklist: identify a realistic failure, then use the cheapest reliable check.
- During iteration avoid repeated broad checks. Use targeted ESLint where
  practical and run project typecheck once after contract-relevant executable
  TypeScript is substantially complete.
- For visible work use one dev server/browser session and targeted probes for the
  changed acceptance behavior and nearest plausible regression boundary. Never
  dump a full DOM/accessibility tree or repeated dataset by default.
- Inspect with `git diff --name-only` and `git diff --stat`; open only relevant or
  suspicious hunks. Do not print a complete milestone diff by default.
- Tool discovery must answer a concrete need. Never request a complete tool,
  plugin or capability catalog; prefer `rg`, import and call-site search.
- A passing check remains valid until a later change can invalidate it.
  Documentation-only edits do not trigger repeated application verification.
- Before any extra check ask: what failure it detects, whether the diff can cause
  it, and whether a cheaper reliable check exists. Skip generic regression smoke.
- For API/data changes validate only changed contract invariants with compact,
  deterministic probes. Shared changes expand scope only after identifying their
  actual consumers.
- Target roughly 15k–25k visible context for a normal local feature. Above
  25k–30k, first look for broad reads, catalogs, DOM dumps, repeated checks,
  historical reports, large diffs or duplicated specifications.
- Minimize output: summarize PASS results; for failures show the failing
  assertion/stack/source first and expand only as needed.
- Commentary marks phases, blockers, direction changes and long-check completion.
  Final responses contain status, verification, material limitation, report link
  and requested commit title.

## Architecture guardrails

- Preserve approved Product/UX decisions, routing architecture, CSS Modules and
  semantic HTML.
- Keep SLA, lifecycle, ownership and fraud risk separate concepts.
- Avoid premature abstractions and generic UI-kit components without demonstrated
  reuse. Do not define a full ReviewCase domain model just for Review Queue.
- Keep visual tokens in CSS; do not duplicate them in TypeScript.
- Do not introduce Redux, Zustand, Axios, TanStack Table, Next.js, Tailwind,
  CSS-in-JS, Storybook or backend infrastructure without an explicitly approved
  milestone.
- TanStack Query and MSW are planned only for the approved Async Data milestone.

## Dependencies

Do not add a dependency unless the current milestone explicitly allows it or
implementation is genuinely blocked without it. In the latter case, stop and
report the required dependency and reason for approval; never silently add an
unapproved dependency. Do not change package scripts outside approved scope.

## Quality and reports

Verification follows the current diff. The universal minimum for any repository
change is final scope inspection, confirmation that unrelated files were not
changed, and `git diff --check`. Additional checks require a concrete failure mode:

- Documentation only: diff scope and diff check.
- Local CSS: affected browser surface and diff check; targeted lint if applicable.
- Local TS helper: targeted lint, project typecheck when contracts/imports matter,
  and diff check.
- Local UI: targeted lint, typecheck, changed browser interaction and diff check.
- API/query/mutation: targeted lint, typecheck, relevant runtime/browser flow,
  one production build when the production path changed, and diff check.
- Router/provider/shared infrastructure: broaden only to actual consumers, then
  run representative lint/typecheck/build/runtime checks.
- Dependency/config/build changes: full relevant static/build verification and a
  representative application smoke.

During FUNCTIONAL DEVELOPMENT, do not create, modify, run or debug automated
tests. Record important future coverage in `docs/tasks/deferred-tests.md`; tests
run only in the dedicated Final Testing & Hardening phase.

Use full repository lint only for shared infrastructure/configuration, broad
cross-feature changes, impractical targeted invocation, or an explicit milestone
requirement. Run a production build only when compilation, bundling, module/route
resolution, CSS imports, dependencies, assets or build-time behavior can change.
If a required script is absent, report it rather than inventing a replacement.
Before human acceptance, inspect the final diff, including new files, for scope
and unintended changes.
Reports must state actual command results, limitations and deviations, not
marketing summaries. A passing check is not human acceptance.

## Browser review

Browser review is required only when observable runtime or UI behavior changed.
Test the changed behavior and its nearest plausible regression boundary, not
accepted unrelated functionality. When browser review is required:

1. Start the local development server and open the affected route.
2. Use the applicable target viewport only when visual acceptance depends on it.
3. Probe required changed states, relevant keyboard/focus behavior and console.
4. Measure geometry only when the diff can affect that geometry.
5. Report route, viewport, console findings, state checks and any unavailable
   review capability. Do not claim unperformed checks passed.

Glass/blur must never be required for legibility. For documentation-only changes,
record that browser review is not required when application behavior is unchanged.

## Accessibility

Accessibility is part of implementation, not an optional later pass. Verify the
new or modified interaction only: accessible name, native semantics, keyboard,
pending/error behavior and focus as applicable. Preserve text alternatives to
color-only state, reduced-motion support and usable opaque material fallbacks;
do not recertify unrelated accepted accessibility behavior.

## Human gates

STOP implementation and report `BLOCKED / NEEDS_DECISION` if completing the task
requires any of the following without explicit approval:

- changing product scope or adding/removing a global destination;
- changing a major architecture decision or replacing routing/state/styling;
- introducing an unapproved major dependency;
- destructive Git operations;
- large refactors unrelated to the milestone;
- major changes to the approved visual direction.

Record task status as `BLOCKED`, with the decision needed. `NEEDS_DECISION` is a
reason for the block, not an additional task status. Do not commit, push, publish
or deploy unless requested.

## Scope discipline

Only implement the current milestone. Do not opportunistically implement future
backlog work or refactor unrelated code unless needed to complete the milestone
safely. Update durable documentation when approved decisions or implementation
facts change; never rewrite approval history as if new decisions were preapproved.

Keep `docs/tasks/current.md` compact and update it only for a material scope,
status or blocker change. Do not duplicate one decision across Product, Visual,
Architecture, tasks and reports; each layer records only its responsibility.
Never rewrite an accepted historical milestone report.
Milestone prompts should reference stable repository rules and sources instead of
repeating them.
