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
- Opening a queued case is read-only and never claims it. Claim is an explicit
  analyst action that moves an available case from `queued` to `in_review` only
  after authoritative server success.
- Claim uses the case version as a concurrency token. The current analyst comes
  from server/session context; the browser does not choose an analyst identity.
- A case claimed by another analyst remains readable but is not claimable by the
  current analyst. An invalidated case cannot be claimed.
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

The Queue and Workspace use typed async APIs backed by deterministic MSW fixtures
in local development. Transaction History and the explicit Claim transition are
implemented. Claim has no real backend persistence or authentication; MSW models
the server-owned current analyst and deterministic concurrency outcomes. Release,
Block, final Decision execution, Queue return context and Case History remain
future work and are not authorized by this baseline alone.
