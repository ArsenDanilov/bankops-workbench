# Current milestone

## Milestone

W5 — Review Case Workspace Claim Workflow

## Status

NEEDS_REVIEW

## Goal

Implement the explicit Review Case Claim workflow:

`queued → in_review`

A case is never claimed merely by opening it.

The analyst must explicitly take the case into review.

## Source of truth

### Product

`docs/product/product-spec.md`

Relevant topics only:

- ReviewCase lifecycle;
- ownership;
- explicit Claim semantics;
- another analyst's case;
- invalidated cases;
- Review Queue membership.

### Visual

`docs/visual/review-case-workspace.md`

Relevant topics only:

- Decision Rail;
- queued / available Claim state;
- in_review / you state;
- another-analyst read-only state where required by Claim result;
- focus/accessibility behaviour.

Do not redesign accepted first-fold geometry.

### Architecture

`docs/architecture/architecture-decisions.md`

Relevant topics only:

- ReviewCase version;
- Claim mutation;
- pessimistic mutation strategy;
- authoritative mutation response;
- Queue invalidation;
- Claim conflicts;
- TanStack Query ownership.

## Scope

Implement:

- queued / available Workspace state;
- explicit Claim action;
- `POST /api/review-cases/:caseId/claim`;
- `expectedVersion`;
- pending Claim state;
- successful `queued → in_review`;
- assignment to the current analyst;
- authoritative Workspace cache update;
- Review Queue cache invalidation;
- same-analyst retry/recovery semantics;
- Claim conflict when another analyst already owns the case;
- invalidated-before-claim conflict;
- appropriate focus and announcement after success/conflict;
- deterministic MSW Claim behaviour.

## Fixed invariants

- Opening a case does NOT claim it.
- Claim is an explicit user action.
- Claim is not optimistic.
- Do not display ownership as `You` before server success.
- Current analyst identity comes from server/session context.
- Do not send arbitrary `analystId` from the UI.
- Claim request includes `expectedVersion`.
- ReviewCase `version` remains the concurrency token.
- Successful Claim changes:
  - `queued`
  - unassigned
  →
  - `in_review`
  - assigned to current analyst
  - `startedAt`
  - `updatedAt`
  - incremented version.
- Claim mutation returns authoritative current Workspace projection.
- Successful Claim updates the exact Workspace cache.
- Successful Claim invalidates Review Queue queries.
- Do not manually patch every cached Queue filter/page.
- Another analyst's case remains readable.
- Invalidated case cannot be claimed.
- No optimistic rollback architecture is needed because Claim is pessimistic.

## Out of scope

Do NOT implement:

- Release;
- Block;
- Decision form;
- Decision mutation;
- final Decision readiness state machine;
- Transaction History redesign;
- new History functionality;
- realtime;
- polling;
- SSE;
- WebSocket;
- Case History;
- responsive/mobile redesign;
- new dependencies;
- automated tests.

## Human Gates

Stop before proceeding if:

- accepted Claim Product semantics must change;
- API contract conflicts materially with accepted Architecture;
- accepted Visual geometry must materially change;
- required current-user/session semantics cannot be represented without
  inventing a new auth architecture;
- a new dependency is required;
- existing source-of-truth documents materially contradict one another;
- approved deterministic fixture/state required for Claim is missing and cannot
  be derived without inventing Product semantics.

## Verification

No automated tests during this milestone.

Required final verification:

- browser/runtime review of Claim states;
- accessibility review of Claim interaction;
- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `git diff --check`.

Automated tests:

Deferred by project policy until Final Testing & Hardening.

## Deferred test obligations

Record W5 coverage obligations in:

`docs/tasks/deferred-tests.md`

Keep them concise.

At minimum:

- queued case renders Claim state;
- opening case does not claim it;
- successful Claim;
- expectedVersion sent;
- authoritative ownership after success;
- Workspace cache update;
- Queue invalidation;
- same-analyst recovery;
- another-analyst Claim conflict;
- invalidated-before-claim conflict;
- focus after success;
- focus/announcement after conflict.

## Report

Create:

[W5 implementation report](../reports/W5-workspace-claim.md)

Status:

`NEEDS_REVIEW`

Do not begin W6.
