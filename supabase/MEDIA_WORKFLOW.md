# Media asset workflow

## Current provider state

Image generation and text-to-speech have typed server-side adapter interfaces. Only clearly labelled mock adapters are enabled. No provider is connected until credentials, commercial terms, rights, retention and quality have been reviewed. Do not select or imitate a real person's voice without documented permission.

## Uploads and malware safety

Uploads request a short-lived signed URL for the private `media-quarantine` bucket. API validation limits uploads to JPEG/PNG/WebP, MP4, MPEG/WAV/M4A audio and VTT captions, max 100 MB. Signed URLs are scoped to a generated object path, and the upload is not a public asset. A production deployment must run a malware scanner on quarantine objects and only copy clean files into a separate private approved bucket. Do not serve user uploads or allow them into rendering before scan status is recorded. Validate file signatures server-side after upload; browser MIME and extensions are not trustworthy. Apply per-user rate limiting at the edge/API layer before enabling uploads at scale.

The current upload URL route enforces file name/type/size metadata and authenticated role. The storage bucket is private. Malware scanning, signature inspection, per-user quota enforcement and clean-bucket promotion are intentionally documented deployment requirements, not claimed as implemented.

## Rights and production gate

Asset rights statuses are `unknown`, `pending-review`, `licensed`, `owned`, and `disallowed`. Every asset linked to a scene must be `licensed` or `owned` before a production job can queue/run or a video can become approved/scheduled/published. Original mock assets are placeholders only and are not usable licensed content. Record creator, attribution, source URL, license and costs before clearing rights.

## Migration and rollback

Apply `202611250004_media_asset_workflow.sql` after the core and RLS migrations. Rollback is destructive to media assignment metadata; back up first. Reverse by dropping the guard triggers/functions and policies, then `scene_media_assets`, new media columns/constraints/indexes and the private bucket only after its objects have been safely migrated/deleted. Do not remove the bucket or media paths while referenced assets exist.
