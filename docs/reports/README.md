# Milestone reports

Write one factual, decision-oriented Markdown report per milestone, normally
about 60–100 lines unless complexity genuinely requires more. Keep
completed reports as history; replace the current task rather than accumulating
backlog work in it. Link the report from `docs/tasks/current.md`.

Reference Product/Visual/Architecture source of truth instead of copying the
prompt, fixtures, source code or complete logs. Report actual results and
limitations. `PASS` means the milestone's checks passed,
not human acceptance; use `NEEDS_REVIEW` when awaiting human review and `BLOCKED`
when an unresolved decision prevents completion. Missing scripts are reported as
not available, never as passing. Explain skipped checks and browser/tooling limits.

```markdown
# <Milestone> — Implementation Report

## Status

PASS | NEEDS_REVIEW | BLOCKED

## Goal

## Implemented

## Files changed

## Dependencies added

None, or explicit list with reason.

## Verification

- lint:
- typecheck:
- test:
- build:

## Browser review

Not required, or:

- route:
- viewport:
- console:
- visual/state checks:

## Accessibility review

## Architecture deviations

None, or explicitly documented.

## Known issues

## Recommended next step
```
