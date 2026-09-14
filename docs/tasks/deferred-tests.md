# Deferred automated tests

Automated coverage is deferred to the final Testing & Hardening phase.

## W5 — Claim workflow

- queued case renders Claim and opening it does not claim it;
- success sends `expectedVersion` without analyst identity;
- pending prevents duplicate submission and remains pessimistic;
- success applies authoritative ownership/version to the details cache;
- success invalidates the Review Queue query family;
- same-analyst retry returns the authoritative claimed state;
- another-analyst conflict replaces stale details and remains read-only;
- invalidated-before-claim replaces stale details and removes Claim;
- success moves focus and announces the updated rail context;
- conflict moves focus and exposes an accessible announcement.
