# Current implementation milestone

Current milestone:
M10 — Async Data Foundation

Status: NEEDS_REVIEW

Report: docs/reports/M10-async-data-foundation.md

## Approved assignment

The human supplied and approved the complete M10 implementation prompt. M9 is
accepted and present on the main development line. Implement only the async data
foundation described by that dedicated prompt.

Replace direct Queue fixture consumption with TanStack Query server state, a
typed native-fetch boundary and an MSW mock backend. Preserve URL-owned controls,
ephemeral UI state, Product/Visual behavior and all meaningful M9 protections.
Connect initial/background loading, refresh, response metadata, error/retry,
real server pagination and explicit incoming-case incorporation.

Approved new packages are `@tanstack/react-query` and `msw`. Axios, another
state library, backend framework and all M10 out-of-scope features remain
forbidden. Complete lint, typecheck, test, build and focused localhost browser
review. Write the declared report and finish NEEDS_REVIEW, never ACCEPTED.

## Next milestone boundary

If M10 is human-accepted, recommend Review Case Workspace — Visual Design.
Do not implement it in this task.
