# BankOps — Product/UX Baseline

## Purpose and user

BankOps supports the Fraud Review Analyst investigating outgoing retail transfers.
The unit of work is a **ReviewCase**, not a client or an isolated operation screen.

## Approved information architecture

- Review Queue → Review Case Workspace.
- Case History → Review Case Workspace (read-only).
- No Dashboard, Client Profile or separate Operation Details destination.

This is the approved product direction, not a list of implemented routes. Review
Queue and the minimal W1 Workspace data-foundation route are implemented; the
full Workspace experience and Case History remain future work.

## Decisions and ownership

- The analyst workflow includes claim, release and block.
- A block rationale is required; a release comment is optional.
- Multiple owned `in_review` cases are allowed.
- Lifecycle, ownership, operational urgency and fraud evidence remain distinct.
- SLA measures operational urgency, not fraud risk. A breach is not proof of fraud.

## Decision readiness and investigation contexts

The following contexts are always required for a final **ReviewDecision**:

- Operation context;
- Risk Assessment;
- Customer behavioral context;
- relevant Transaction History;
- Recipient Relationship.

Device and Location context are conditional: they are required only when
connected to current risk signals or when necessary to verify specific evidence.

These are existing approved Product decisions, explicitly confirmed during
M-AUTO1 human acceptance, not new requirements. Queue columns are not a substitute
for the Workspace's decision-readiness contexts.

## Current implementation boundary

The Queue and minimal Workspace details route use typed async APIs backed by
deterministic MSW fixtures in local development. There is still no real server
persistence, claim/release/block execution, final Workspace layout, Queue return
context or history. Product decisions above must not be treated as authorization
to implement those features now.
