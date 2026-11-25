# Testing & acceptance matrix

These checks are the acceptance contract for the product. A check marked as code-level is not a substitute for staging integration testing with Supabase, storage, worker processes and production-like browser/device profiles.

| Area | Test | Expected result | Current verification |
|---|---|---|---|
| Public visibility | Open a draft URL while logged out. | 404/not found; no private data returned. | Unit coverage for published-only repository reads; browser/database test still required. |
| Feed | Scroll through feed on phone. | Current video plays; off-screen video pauses. | IntersectionObserver pause/play behavior is implemented; mobile browser test required. |
| Autoplay | Open page with sound restrictions. | Muted autoplay or clear play control; no unexpected sound. | Player initializes muted and catches autoplay rejection; browser test required. |
| Language | Switch EN to SW. | Correct localized title/script/video appears where available. | Story language model and localized fields exist; end-to-end alternate-video test required. |
| Search | Search a partial title and no-match phrase. | Relevant results and clear empty state. | Search UI exists; browser test required. |
| Authentication | Visit admin route logged out. | Redirect/deny access. | Blocked until Supabase auth is configured and route access tested. |
| Roles | Editor attempts owner-only setting. | Access denied and action logged where appropriate. | Workflow/route checks exist; staging role-matrix/RLS tests required. |
| RLS | Query private story/source/cost tables as anon. | No private rows returned. | Not verified against a live Supabase project. |
| AI output | Provider returns invalid JSON. | Validation fails safely; no malformed story saved as approved. | Zod structured-output validation exists; provider integration test required. |
| Fact-check | Claim has no source. | Story cannot pass factual approval gate. | Code-level evidence gate test exists; database integration test required. |
| Rights | Scene asset has unknown rights. | Final approval/publishing blocked. | Rights policy and SQL gates exist; apply migration and verify in staging. |
| Production | Worker fails midway. | Job shows failure, logs reason and supports safe retry. | Worker/error flow exists; retry recovery/backoff and staging fault-injection test required. |
| Rendering | Render sample 55-second story. | Valid 1080x1920 MP4 with audio and captions. | FFmpeg adapter exists; requires worker host and real sample run. |
| Approval | Edit script after approval. | Approval invalidated; new review required. | SQL trigger and hash model added; staging migration test required. |
| Publishing | Try to publish rejected video. | Blocked server-side. | Publish RPC checks current approved review; staging negative test required. |
| Unpublish | Unpublish a live video. | Public feed and story page no longer serve it. | Takedown RPC and public status filters exist; staging/cache invalidation test required. |
| Performance | Load home and feed on mobile network simulation. | Images lazy-load; layout remains usable; no giant blocking assets. | Not measured. Run Lighthouse/WebPageTest at constrained mobile profiles. |
| Backup | Restore staging from backup. | Restore process documented and verified. | Procedure documented in readiness audit; actual restore not performed. |

## Release gate

The project must not be called launch-ready until every critical row is **PASS** in a staging environment, evidence is recorded, critical failures are fixed, and the legal and operational sign-offs are complete. “Implemented” or “unit tested” is not equivalent to deployed and verified. Keep admin features, production workers and publishing disabled if their authorization, migrations, storage security or required operational dependencies are unverified.

Record each execution with commit SHA, environment, date, tester, command/browser/device, result, evidence URL and follow-up issue. Do not put credentials, user data or private content in the evidence log.
