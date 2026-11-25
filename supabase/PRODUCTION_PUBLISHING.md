# Async production and publishing

## Architecture

Next.js routes validate requests and enqueue database rows; they never render. Run `npm run worker` on a separate long-running Node worker with FFmpeg/FFprobe installed and server-only Supabase variables. `npm run publication-worker` runs the separate due-publication worker. Workers claim queue rows using `FOR UPDATE SKIP LOCKED` RPCs. Vercel functions are not used for long video renders.

The initial template downloads private approved scene images and voice tracks, creates 1080x1920/30fps H.264 + AAC image/voice/caption segments, concatenates them, probes stream sync/dimensions/duration, rejects black-frame counts when a detector is supplied, creates a thumbnail and uploads both artifacts to a private bucket. Outputs remain private until published; a short-lived URL is issued only after checking video state and caller authorization.

Install FFmpeg and FFprobe on the worker host, configure private `media-approved` bucket and environment variables, then run workers. The migration defines the queue and lease-safe claim function. Production deployments should additionally configure a dedicated durable worker host, process supervision, queue monitoring, and retries/backoff. Do not execute worker code in the Next.js deployment.

## Worker environment

Required on worker only: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FFMPEG_PATH` (optional), `FFPROBE_PATH` (optional), `MEDIA_APPROVED_BUCKET` (optional). Never expose service role credentials to web clients. `npm run worker` and `npm run publication-worker` run separate processes.

## Readiness and validation

Jobs require a story in `ready-for-production`, at least one scene, an image and a voice asset for every scene, and cleared `licensed` or `owned` rights. Rendering checks missing streams/assets, 1080x1920, duration, audio/video stream start-time delta and creates a thumbnail. The current black-frame detector reports no detection (0) rather than analyzing frames; enable a real detector/blackdetect pass on the worker before production. Music input is rejected unless rights are explicitly cleared; this first template does not mix optional music yet.

## Review and publication

Review submission only uses private rendered media. Review records bind reviewer, timestamp, checklist and version hash. Only owner/admin may approve/publish/take down; rejection is recorded and returns video to rejected state. A scheduled row is claimed by a separate publication worker. Public video API selects only published + approved records and never returns storage paths. Media routes issue short-lived signed URLs only after published status or an authorized studio session. English and Kiswahili videos have separate language rows and may point to alternate language videos.

Apply `202611250005_production_and_publishing.sql` after previous migrations. Rollback requires backup. Reverse by pausing workers and scheduled jobs, removing functions/triggers/policies/tables/indexes/columns added by this migration, then types only after dependent objects are dropped. Preserve video objects until their retention policy is confirmed.
