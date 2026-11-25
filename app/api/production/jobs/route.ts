import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";

const startSchema = z.object({ storyId: z.string().uuid(), language: z.enum(["en", "sw"]), idempotencyKey: z.string().min(8).max(120), estimatedCostUsd: z.number().min(0).max(1000).default(0) });

export async function POST(request: Request) {
  try {
    const { supabase, user, profile } = await requireAdmin();
    if (!["owner", "admin", "producer"].includes(profile.role)) return NextResponse.json({ error: "Producer role required." }, { status: 403 });
    const input = startSchema.parse(await request.json());
    const { data: existing } = await supabase.from("production_jobs").select("id,status").eq("idempotency_key", input.idempotencyKey).maybeSingle();
    if (existing) return NextResponse.json({ job: existing }, { status: 200 });
    const { data: story, error: storyError } = await supabase.from("stories").select("id,status,title_en,title_sw").eq("id", input.storyId).single();
    if (storyError || !story || story.status !== "ready-for-production") return NextResponse.json({ error: "Story must be ready-for-production." }, { status: 422 });
    const { data: scenes, error: scenesError } = await supabase.from("scenes").select("id,position,start_seconds,end_seconds,narration_en,narration_sw,on_screen_text,scene_media_assets(position,media_assets(id,storage_path,rights_status_v2,kind))").eq("story_id", input.storyId).order("position");
    if (scenesError || !scenes?.length) return NextResponse.json({ error: "At least one scene is required." }, { status: 422 });
    const payloadScenes = [];
    for (const scene of scenes) {
      const assignment = scene.scene_media_assets?.find((row: { media_assets?: { kind?: string } }) => row.media_assets?.kind === "generated-image" || row.media_assets?.kind === "upload" || row.media_assets?.kind === "licensed-stock");
      const image = assignment?.media_assets;
      const audio = scene.scene_media_assets?.find((row: { media_assets?: { kind?: string; rights_status_v2?: string } }) => row.media_assets?.kind === "audio" && ["licensed", "owned"].includes(row.media_assets?.rights_status_v2 ?? ""))?.media_assets;
      if (!image?.storage_path || !audio?.storage_path) return NextResponse.json({ error: `Scene ${scene.position + 1} needs an approved image and voice asset.` }, { status: 422 });
      const assetRows = scene.scene_media_assets?.map((row: { media_assets?: { rights_status_v2?: string } }) => row.media_assets).filter(Boolean) ?? [];
      if (assetRows.some((asset: { rights_status_v2?: string }) => !["licensed", "owned"].includes(asset.rights_status_v2 ?? ""))) return NextResponse.json({ error: `Scene ${scene.position + 1} contains assets without cleared rights.` }, { status: 422 });
      payloadScenes.push({ sceneId: scene.id, imageStoragePath: image.storage_path, voiceStoragePath: audio.storage_path, captionText: input.language === "sw" ? scene.narration_sw ?? scene.on_screen_text ?? "" : scene.narration_en ?? scene.on_screen_text ?? "", durationSeconds: Number(scene.end_seconds) - Number(scene.start_seconds) });
    }
    const payload = { jobId: crypto.randomUUID(), storyId: story.id, language: input.language, scenes: payloadScenes, musicRightsCleared: true };
    const { data: job, error } = await supabase.from("production_jobs").insert({ story_id: story.id, type: "vertical-image-voice-caption", status: "queued", stage: "queued", input_payload: payload, estimated_cost_usd: input.estimatedCostUsd, idempotency_key: input.idempotencyKey, created_by: user.id }).select("id,status,stage,created_at").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabase.from("production_job_logs").insert({ job_id: job.id, level: "info", stage: "queued", message: "Job validated and enqueued for the separate worker." });
    return NextResponse.json({ job }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not enqueue job.";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400 });
  }
}
