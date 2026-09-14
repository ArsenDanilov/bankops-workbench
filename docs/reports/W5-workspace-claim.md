# W5 — Review Case Workspace Claim Workflow — Implementation Report

## Status

NEEDS_REVIEW

## Goal

Implement the explicit, pessimistic `queued → in_review` Claim workflow without
starting Release, Block or Decision submission.

## Implemented

- Canonical Workspace now opens `queued` and `Available`; opening it does not
  assign ownership.
- The Decision Rail exposes one native `Take into review` button and no disabled
  or placeholder Release/Block controls.
- Claim calls `POST /api/review-cases/:caseId/claim` with `expectedVersion`
  only; the mock server owns current-analyst identity.
- Pending disables duplicate activation, shows explicit progress and retains
  queued/available state until the response succeeds.
- Success applies the authoritative `in_review` / current-analyst projection,
  server timestamps and incremented version to the exact Workspace cache.
- Success invalidates the complete `['reviewQueue']` query family.
- Same-analyst retry returns the already-claimed authoritative projection.
- Deterministic MSW scenarios model another-analyst and invalidated-before-claim
  `409` responses with authoritative current details.
- Conflict details replace stale Workspace state, invalidate Queue queries and
  keep investigation evidence readable in explicit read-only states.
- Success and conflict announcements are exposed to assistive technology and
  focus moves to the updated workflow context with a visible focus ring.

## Files changed

- Claim API, details query integration and Decision Rail presentation.
- Deterministic Workspace fixture/state and MSW handlers.
- Product, Visual and Architecture sources for implemented W5 facts.
- Current milestone capsule and deferred automated-test ledger.

## Dependencies added

None.

## Verification

- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; 115 modules transformed.
- `git diff --check`: PASS; Windows line-ending notices only.
- Automated tests: not created, modified or run; deferred by approved W5 policy.

## Browser review

- Route: `/review-cases/RC-260907-0314` plus deterministic mock conflict query
  variants; returned to `/review-queue` after Claim invalidation.
- Viewport: 1440 × 900.
- Initial: `Queued` / `Available`, Claim present, no Release/Block.
- Pending: progress visible, action disabled, no premature `You` ownership.
- Success: authoritative `In review` / `You`, Claim removed, announcement and
  workflow focus confirmed.
- Another analyst: conflict announced, `Marta Ruiz` read-only state, Claim
  removed and evidence retained.
- Invalidated: terminal state announced, Claim removed and evidence retained.
- Geometry: 1008px canvas, 24px gap, 360px rail; no horizontal overflow.
- Queue: rendered ten rows after return; no horizontal overflow.
- Console: no warnings or errors.
- Local server used Vite's approved `--configLoader native` option because the
  restricted Windows host rejects the default config-loader subprocess.

## Accessibility review

- Native button works by keyboard and prevents duplicate pending activation.
- Pending copy, success status and conflict alerts are textual, not color-only.
- Programmatic focus lands on the updated rail context and remains visibly
  indicated; Risk and Transaction History keyboard navigation remains usable.

## Architecture deviations

None.

## Known issues

Automated W5 coverage is intentionally deferred in
`docs/tasks/deferred-tests.md`.

## Recommended next step

Human review of W5. Do not define or begin W6 until W5 is accepted.
