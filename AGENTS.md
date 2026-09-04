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
3. Read [Product/UX](docs/product/product-spec.md),
   [architecture](docs/architecture/architecture-decisions.md), and the relevant
   [visual system](docs/visual/visual-system.md) and
   [Review Queue specification](docs/visual/review-queue.md).
4. Inspect the relevant code and Git status. Preserve useful documentation and
   unrelated user changes. If approved sources conflict or lack a decision
   necessary for implementation, report it instead of inventing a requirement.
5. Implement the smallest scoped change, verify it, and write a report using
   [the report contract](docs/reports/README.md).
6. Set the current task to `NEEDS_REVIEW` when implementation is ready for human
   review. Only a human may accept it; never set `ACCEPTED` autonomously.

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

Every implementation milestone must run the verification commands relevant to
the repository. At minimum, where available:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

If a script is absent, report that fact; do not invent an unrelated replacement.
Inspect the final Git diff, including new files, for scope and unintended changes.
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
