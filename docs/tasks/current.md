# Current implementation milestone

Current milestone:
W1 — Review Case Workspace Route + Data Foundation

Status: NEEDS_REVIEW

Report: docs/reports/W1-workspace-data-foundation.md

## Approved assignment

The human supplied and approved the complete W1 implementation prompt. Review
Queue M1–M10 are accepted. Implement only the Workspace route and detailed-read
data foundation described by that dedicated prompt.

Add `/review-cases/:caseId`, a separate grouped `ReviewCaseDetails` projection,
typed native-fetch details API, TanStack Query ownership and deterministic MSW
canonical/404 behavior. Render only the minimal semantic loading, error,
not-found and success states needed to prove the architecture. Preserve Review
Queue behavior and do not implement the final Workspace layout or mutations.

No dependencies are approved or needed. Complete lint, typecheck, test, build and
focused localhost browser review. Write the declared report and finish
NEEDS_REVIEW, never ACCEPTED.

## Next milestone boundary

If W1 is human-accepted, recommend
**W2 — Workspace Structural Layout + First-Fold Evidence**. Do not implement it
in this task.
