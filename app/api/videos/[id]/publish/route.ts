import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";
const schema = z.object({ scheduledAt: z.string().datetime().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user, profile } = await requireAdmin();
    if (!["owner", "admin"].includes(profile.role)) return NextResponse.json({ error: "Owner/admin publisher role required." }, { status: 403 });
    const body = schema.parse(await request.json());
    const { id } = await params;
    if (body.scheduledAt) {
      if (Date.parse(body.scheduledAt) <= Date.now()) return NextResponse.json({ error: "Schedule must be in the future." }, { status: 422 });
      const { data: video, error: videoError } = await supabase.from("videos").select("id,status,approved_by,approved_at,render_validated,rights_cleared,captions_ready,thumbnail_path,source_ledger_complete").eq("id", id).single();
      if (videoError || !video || video.status !== "approved" || !video.approved_by || !video.approved_at || !video.render_validated || !video.rights_cleared || !video.captions_ready || !video.thumbnail_path || !video.source_ledger_complete) return NextResponse.json({ error: "Video has not passed the human review and readiness gate." }, { status: 422 });
      const { data: queued, error } = await supabase.from("publication_jobs").insert({ video_id: id, scheduled_at: body.scheduledAt, created_by: user.id }).select("id,status,scheduled_at").single();
      if (error) throw error;
      await supabase.from("videos").update({ status: "scheduled" }).eq("id", id);
      return NextResponse.json({ publicationJob: queued }, { status: 202 });
    }
    const { data, error } = await supabase.rpc("publish_video", { p_video_id: id });
    if (error) return NextResponse.json({ error: error.message }, { status: 422 });
    return NextResponse.json({ video: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
