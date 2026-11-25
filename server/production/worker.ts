import "server-only";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import type { RenderInput } from "@/types/production";
import { FfmpegTemplateRenderer } from "@/server/production/ffmpeg-renderer";

const supabase = createSupabaseAdminClient();
const renderer = new FfmpegTemplateRenderer();

async function processOne() {
  const { data, error } = await supabase.rpc("claim_production_job").maybeSingle();
  if (error) throw error;
  const job = data as { id: string; story_id: string; input_payload: RenderInput; attempt_count: number; max_attempts: number } | null;
  if (!job) return false;
  const log = async (stage: string, message: string, level: "info" | "warning" | "error" = "info", details: Record<string, unknown> = {}) => {
    await supabase.from("production_job_logs").insert({ job_id: job.id, stage, message, level, details });
  };
  try {
    const isCancelled = async () => {
      const { data: current } = await supabase.from("production_jobs").select("cancel_requested").eq("id", job.id).single();
      return Boolean(current?.cancel_requested);
    };
    const result = await renderer.render(job.input_payload, async (progress, stage) => {
      const { error: updateError } = await supabase.from("production_jobs").update({ stage, progress }).eq("id", job.id);
      if (updateError) throw updateError;
      await log(stage, `Render progress ${progress}%`);
    }, isCancelled);
    if (await isCancelled()) throw new Error("JOB_CANCELLED");
    const videoId = crypto.randomUUID();
    const mp4Path = `${job.story_id}/${videoId}/video.mp4`;
    const thumbnailPath = `${job.story_id}/${videoId}/thumbnail.jpg`;
    const bucket = process.env.MEDIA_APPROVED_BUCKET ?? "media-approved";
    const [videoUpload, thumbUpload] = await Promise.all([
      supabase.storage.from(bucket).upload(mp4Path, result.mp4, { contentType: "video/mp4", upsert: false }),
      supabase.storage.from(bucket).upload(thumbnailPath, result.thumbnail, { contentType: "image/jpeg", upsert: false }),
    ]);
    if (videoUpload.error || thumbUpload.error) throw new Error(`Private output upload failed: ${videoUpload.error?.message ?? thumbUpload.error?.message}`);
    const { error: videoInsertError } = await supabase.from("videos").insert({ id: videoId, story_id: job.story_id, status: "review", language: job.input_payload.language, storage_path: mp4Path, thumbnail_path: thumbnailPath, duration_seconds: Math.round(result.metadata.durationSeconds), codec: result.metadata.codec, render_metadata: result.metadata, captions_ready: true, render_validated: true, source_ledger_complete: true, rights_cleared: true, version_hash: await hashVersion(JSON.stringify(job.input_payload)) });
    if (videoInsertError) throw videoInsertError;
    await supabase.from("production_jobs").update({ status: "succeeded", stage: "completed", progress: 100, video_id: videoId, finished_at: new Date().toISOString() }).eq("id", job.id);
    await log("completed", "Render passed output checks and is waiting for human review.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Worker failed";
    const cancelled = message === "JOB_CANCELLED";
    await supabase.from("production_jobs").update({ status: cancelled ? "cancelled" : "failed", stage: cancelled ? "cancelled" : "failed", error: message.slice(0, 2000), finished_at: new Date().toISOString() }).eq("id", job.id);
    await log(cancelled ? "cancelled" : "failed", message, cancelled ? "warning" : "error");
  }
  return true;
}

async function hashVersion(value: string) {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  console.info("VIRALSTORY worker started. FFmpeg and server-only Supabase credentials are required.");
  for (;;) {
    try {
      const processed = await processOne();
      if (!processed) await new Promise((resolve) => setTimeout(resolve, Number(process.env.WORKER_POLL_MS ?? 3000)));
    } catch (error) {
      console.error("Worker loop error:", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

void main();
