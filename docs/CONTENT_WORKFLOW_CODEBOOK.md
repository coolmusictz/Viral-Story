# Codebook workflow and QA acceptance

The content production flow is: discover → shortlist → research/verify → draft EN and SW → edit → approve script → storyboard → clear asset rights → render asynchronously → full audiovisual QA → approve exact version → publish/schedule → learn from aggregate analytics.

## Status interoperability

Canonical codebook names are `discovered`, `shortlisted`, `researching`, `needs_verification`, `draft`, `script_approved`, `producing`, `needs_review`, `approved`, `scheduled`, `published`, `rejected`, `failed`, `archived`. A compatibility helper maps existing legacy `fact-check`, `ready-for-production`, and `needs-review` values to canonical names. The migration adds canonical PostgreSQL enum values without destructively rewriting existing data.

## Gates

- Facts require source-backed claim ledger entries; insufficient sources route to `needs_verification` and stop factual generation/production.
- Script approval requires complete evidence, verified material facts and scenes matching target duration.
- Production/review/publishing requires evidence, facts, timing, rights, captions, thumbnail and render validation.
- Final reviewer must watch the entire actual render with sound and pass all QA checklist items, including safe zones, truthful hook, pronunciation, audio sync/peaks, caption accuracy/readability, black frames/bars, rights, facts/attribution, duration/end, and metadata.
- Approval binds reviewer, time and version hash. A changed script invalidates approval. Asset changes must also trigger a new render and review; always compare the render's captured input hash at publish time.
- Rejection requires a meaningful note; failed jobs never become approved automatically. Publish/takedown actions must be audited and publication rechecks all current gates.
- Factual content uses `Verified report` or `Developing story`; viewpoints use `Opinion / commentary`; reconstructions and fiction are labelled `Dramatized reconstruction` or `Fiction / AI story`.

## QA acceptance matrix (starter)

| Area | Acceptance test | Expected result |
|---|---|---|
| Workflow role | Editor attempts publish | Denied; only authorized publisher can publish |
| Evidence | Claim has no source or is disputed | Story cannot pass factual script approval |
| Version integrity | Edit script after approval | Approval is invalidated and review required again |
| Assets | Asset rights unknown/disallowed | Production/review/publish blocked |
| QA | Any required QA checklist flag false | Approval is refused |
| Review | Rejected item has no notes | Rejection refused |
| Publishing | Draft/rejected/changed video | No public record or public media URL |
| Failure | Worker fails | Remains failed; explicit authorized retry required |
| Takedown | Published content taken down | Public API/media no longer serve item; audit record exists |

This matrix supplements automated tests; staging Supabase role/JWT integration tests remain required before production.
