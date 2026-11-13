## Incident Command

INET 4121 team project.

## DevOps Team 4121

| Name | Email | Github | Role | 
| ---- | ----- | ------ | ---- |
| Lincoln Koskela | koske113@umn.edu | LincolnKoskela | Project Lead |
| Faiso Hussein | husse553@umn.edu | faisoabdirisak | Sprint Cordinator | 
| Fenky Wah | wah00021@umn.edu | fenkur | Reviewer / QA |
| Kirubail Yenew | yenew004@umn.edu | KirubailSchool | Tech Lead |
| Vang Thao | thao1102@umn.edu | vangthao-1102 | Documentation | 

## PORT STATUS

| PORT | STATUS |
| ---- | ------ | 
| TBD | UNKNOWN |

## Jira Board 
| Sprint # | 
| -------- |
| [Sprint 1](https://inet4121-spring-2026.atlassian.net/jira/software/projects/INET/boards/34/backlog) | 

## Links

- [Team Charter](https://docs.google.com/document/d/1sV1QwH8ecxSYxVmtXZKglf6mhgYD3GBoIoWfkIKETIA/edit?tab=t.0)
- [Sprint 1](https://inet4121-spring-2026.atlassian.net/jira/software/projects/INET/boards/34/backlog)


---

## Sprint 3 — Incident Command DevSecOps

### Overview

Sprint 3 enhances the Incident Command platform with automated incident escalation, a React CloudOps dashboard, PDF post-mortem reporting, container security hardening, and an automated DevSecOps CI/CD pipeline.

### System Architecture

| Component | Technology | Purpose |
|---|---|---|
| Incident API | Node.js / Express | Incident management and escalation |
| Runbook Service | Python / FastAPI | Runbook operations and PDF reporting |
| CloudOps Dashboard | React / Nginx | Incident monitoring and reporting |
| Database | PostgreSQL 18 | Persistent incident data |
| Containers | Rootless Podman | Application deployment |
| CI/CD | GitHub Actions | Automated build and security checks |

### Deployment Environment

| Service | VM Port | Status |
|---|---|---|
| Incident API | 3100 | Verified HTTP 200 |
| Runbook Service | 5100 | Running |
| CloudOps Dashboard | 8082 | Verified HTTP 200 |
| PostgreSQL SSH tunnel | 15432 | Previously verified |

Application services run on caps-django-dev-app-02.
PostgreSQL runs on caps-postgres-dev-db-01.

### Sprint 3 Features

#### Automated Incident Escalation

The Incident API monitors incidents approximately every 15 seconds and records escalations using these thresholds:

| Priority | Escalation Threshold |
|---|---|
| P0 — Critical | 5 minutes |
| P1 — High | 15 minutes |
| P2 — Medium | 60 minutes |

The escalation process uses an atomic database update to prevent duplicate escalation records.

External notification delivery is not currently configured.

Implementation: backend/src/escalation.js

#### CloudOps Dashboard

The React dashboard provides:

- Incident listing and priority filtering
- P0 critical incident monitoring
- Escalation countdown and status
- Automatic refresh every 15 seconds
- PDF post-mortem download

Implementation: frontend/src/App.tsx

#### PDF Post-Mortem Reports

The Runbook service generates incident post-mortem PDF reports using ReportLab.

Endpoint:

GET /runbooks/incident/{incident_id}/postmortem

Implementation:

- services/runbook/app/postmortem.py
- services/runbook/app/main.py

### Container Security

Sprint 3 implements:

- Rootless Podman containers
- Non-root application users
- Restricted privilege escalation
- Dropped Linux capabilities
- Loopback-only application access
- Digest-pinned base images
- Alpine Linux security package updates

### DevSecOps CI/CD Pipeline

Workflow: .github/workflows/pipeline.yml

| Stage | Tools | Purpose |
|---|---|---|
| Lint | ESLint | Code quality |
| SAST | Semgrep, Bandit | Static security analysis |
| Build | Node.js, Podman | Application and container builds |
| Scan | Trivy, Grype | Container vulnerability scanning |
| Policy | Checkov | Infrastructure security checks |
| Deploy | Placeholder | Future deployment automation |

GitHub Actions validation checks passed.

Security scanning currently operates in report-only mode, so passing checks do not guarantee zero vulnerabilities.

### Security Vulnerability Remediation

Initial scans identified Critical zlib vulnerabilities and High krb5-libs vulnerabilities.

| Package | Previous Version | Updated Version |
|---|---|---|
| zlib | 1.3.2-r1 | 1.4-r0 |
| krb5-libs | 1.22.2-r1 | 1.22.3-r0 |

Updated images were built with the sprint3-secure tag and rescanned on November 13, 2026.

| Image | Trivy HIGH/CRITICAL | Grype Fixable Findings |
|---|---|---|
| API | None reported | 1 Medium |
| Runbook | None reported | 14 findings |
| Frontend | None reported | None |

The previously identified Critical zlib and High krb5-libs vulnerabilities were absent from the updated reports.

Remaining findings include the API qs dependency and Python/pip dependencies.

The remediated images have not yet replaced the running Sprint 3 containers.

### Verification Commands

Check running containers:

    podman ps

Verify Incident API:

    curl -i http://127.0.0.1:3100/incidents

Verify Runbook service:

    curl -i http://127.0.0.1:5100/

Verify CloudOps dashboard:

    curl -I http://127.0.0.1:8082/

The /runbooks endpoint accepts POST requests. GET returns HTTP 405 by design.

### Known Limitations

- Outstanding dependency vulnerabilities require further review.
- External escalation notifications are not implemented.
- Production deployment is not automated.
- PDF endpoint authentication and authorization require review before public exposure.
- Remediated images require functional verification before deployment.

### Sprint 3 Completion Summary

Sprint 3 delivered automated incident escalation, a React CloudOps dashboard, PDF post-mortem generation, container security improvements, and automated DevSecOps validation.

