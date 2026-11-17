# IncidentCommand Role Model

## Roles

- incident-commander: Can declare P0/P1, close incidents, assign commanders
- responder:          Can update incident status, mark runbook steps complete
- observer:           Read-only access to all incidents and runbooks

## Policies

- POLICY-01: Only incident-commander may declare a P0 incident
- POLICY-02: Only incident-commander may close an incident
- POLICY-03: Responders may update status (open → investigating → resolved)
- POLICY-04: Only incident-commander may assign the incident-commander role
- POLICY-05: Observers have no write access
- POLICY-06: All container secrets must be mounted via Podman secret (Checkov)
- POLICY-07: All containers must run as non-root (Checkov)
- POLICY-08: Post-mortem export path must be read-only (Checkov)
