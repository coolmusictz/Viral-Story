# Production readiness audit — 2026-11-25

## Release decision: NOT READY FOR PRODUCTION

This is a repository inspection and code-level checklist, not a live penetration test, browser test, database migration run, or deployment verification. No environment credentials were used. No tests, build, accessibility scanner, Lighthouse run, or RLS integration tests were executed in this environment. A production release must remain blocked until the failed/unverified critical gates below are resolved.

| Area | Result | Evidence / next action |
|---|---|---|
| Public routes / mobile breakpoints | UNVERIFIED | Responsive Tailwind layouts exist; run browser/device E2E at 320px, 375px, 768px and desktop. |
| Accessibility / keyboard | UNVERIFIED | Semantic labels/focus styles exist; run axe and manual keyboard/screen-reader review, including modal behavior. |
| Auth and invited-user policy | BLOCKED | Supabase project migrations/auth configuration not verified. Validate invited user flow and disabled account behavior. |
| RLS unauthorized access | BLOCKED | Requires applying all migrations and testing anon/authenticated JWTs against every table/storage bucket. |
| Admin role permissions | BLOCKED | Several server route checks exist; conduct role matrix tests against DB RPCs and routes. |
| API validation | PARTIAL | Zod validation exists on selected routes; audit every endpoint and add negative-case integration tests. |
| Rate limiting | FAIL / NOT IMPLEMENTED | No durable rate limiting for analytics, login, uploads, AI, or RSS. Configure WAF/managed limiter. |
| Upload security | BLOCKED | Quarantine strategy documented; no actual malware scanner/signature verification/clean promotion. |
| Secret exposure | UNVERIFIED | Service role intended server-only; run secret scanner and inspect production bundle/build output. |
| Publish gates | PARTIAL | SQL functions enforce checklist/rights/approval; must run migrations and adversarial DB tests. |
| Job retries/cancellation | PARTIAL | Queue worker code exists; no deployed worker, supervision, lease recovery/backoff or real FFmpeg validation. |
| Black-frame validation | FAIL | Renderer currently does not perform black-frame detection. Implement and test before production. |
| Analytics | PARTIAL | Consent review, database migration, scheduled retention deletion, bot filtering and durable rate limiting remain. |
| E2E tests | FAIL / NOT CONFIGURED | No Playwright/browser suite in repository. Add critical flow tests before staging sign-off. |
| Image/video delivery | PARTIAL | Private signed media endpoint exists; test cache/security headers and range requests; CDN behavior unverified. |
| Metadata / sitemap / robots | CODE ADDED, UNVERIFIED | Build and validate canonical metadata and sitemap URLs against actual production domain. |
| Core Web Vitals | UNVERIFIED | No field data or Lighthouse runs. Measure staging and fix LCP/CLS/INP. |
| Backups / monitoring / alerts | NOT CONFIGURED | Follow ops runbook; configure DB/PITR, worker monitoring, error alerts and incident paging. |
| Legal: copyright/privacy/terms/cookies/editorial/takedown | COUNSEL REVIEW REQUIRED | Draft and review for Tanzania and every target market. Do not treat this report as legal advice. |
| Staging → production | NOT STARTED | Deploy staging only after migrations and CI pass; test demo content and run release checklist. |

## Required pre-production gates

1. Install dependencies; run lint, typecheck, unit tests and production build. Fix all failures.
2. Apply migrations to a fresh staging project in order, then run migration/RLS/storage tests using anon and each role JWT.
3. Fix SQL migration and schema errors surfaced by the actual Supabase instance; do not apply unreviewed migrations to production.
4. Add durable per-route rate limits, file content signature checks, malware scan and clean-bucket promotion.
5. Implement black-frame detection and worker retry/recovery, queue leases, alerts and resource limits.
6. Add Playwright tests for public published-only visibility, invited auth, role-denied APIs, upload policy, review checklist, publish/takedown, scheduled publishing and job failure/cancel/retry.
7. Complete accessibility, responsive, metadata, caching, range-streaming and Core Web Vitals checks on staging.
8. Confirm backup restore, alert delivery, rollback runbook and incident owner.
9. Obtain qualified local counsel review for privacy notices, consent/cookies, terms, copyright, sponsorship disclosures, corrections and takedown policy.
10. Only after all critical checks pass: stage demo content, obtain sign-off, deploy production and monitor.

## Operations checklist

- Backups: enable managed database backups/PITR appropriate to plan; export migration history; test restore quarterly; protect worker outputs and preserve audit records.
- Migrations: PR review SQL, test on fresh staging, backup before destructive changes, apply one version at a time, verify row counts/RLS, keep rollback notes.
- Monitoring: alert on 5xx/rate-limit spikes, failed auth, worker queue age, retries/failures, storage quota and scheduled publication lag; never log secrets or raw personal data.
- Incident: disable publish and ingestion controls, rotate compromised keys, take down affected content, preserve audit evidence, notify owners/privacy contact, follow legal notification duties, document remediation, restore from verified backup.
