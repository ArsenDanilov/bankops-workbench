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
6. For a non-trivial code change, use `complexity-router` to select proportionate
   Ponytail and Code Review Graph work. Do not run either for a clearly local edit.
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
  interaction/accessibility → integration. Run the smallest affected check and
  nearest regression boundary after each slice.
- During iteration prefer targeted tests and targeted ESLint. Run project
  typecheck after a meaningful typed boundary. Broaden immediately for package,
  config, router/provider/bootstrap, global style/test/MSW lifecycle, shared
  public contract, security or widely reused component changes.
- For visible work use one dev server/browser session and compact probes for
  geometry, overflow, sticky behavior, focus, interaction and console. Take
  screenshots only when they materially aid visual judgment.
- After implementation, browser review and repairs, run affected checks, enter
  code freeze, then run the complete final gate once: lint, typecheck, test,
  build and `git diff --check`. Later application/config changes invalidate it;
  documentation-only edits do not.
- Group tests by coherent responsibility. Do not create a file per tiny scenario,
  merge unrelated tests, disable isolation or alter runner strategy without
  measured evidence and approval. A shared helper requires demonstrated reuse.
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

Use targeted affected-scope verification during implementation. Every completed
implementation milestone must run this complete final gate once after code
freeze, where available:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

If a script is absent, report that fact; do not invent an unrelated replacement.
Before human acceptance, inspect the final Git diff, including new files, for
scope and unintended changes.
Reports must state actual command results, limitations and deviations, not
marketing summaries. A passing check is not human acceptance.

## Browser review

After any visible UI change:

1. Start the local development server and open the affected route.
2. Use the visual specification's target viewport; Review Queue uses 1440 × 900.
3. Check the browser console and required states, including keyboard interaction.
4. Compare with the relevant visual specification and fix obvious implementation
   deviations within scope.
5. Report route, viewport, console findings, state checks and any unavailable
   review capability. Do not claim unperformed checks passed.

Glass/blur must never be required for legibility. For documentation-only changes,
record that browser review is not required when application behavior is unchanged.

## Accessibility

Accessibility is part of implementation, not an optional later pass. Preserve
semantic HTML, native buttons/links, keyboard access, visible focus, text
alternatives to color-only state, reduced-motion support and usable opaque
fallbacks for translucent materials.

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
