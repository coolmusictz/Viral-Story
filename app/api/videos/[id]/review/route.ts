import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";
const schema = z.object({ decision: z.enum(["approved", "rejected"]), versionHash: z.string().min(32).max(128), notes: z.string().max(4000).optional(), checklist: z.object({ scenes: z.boolean(), sources: z.boolean(), factCheck: z.boolean(), rights: z.boolean(), captions: z.boolean(), thumbnail: z.boolean(), renderValidation: z.boolean() }) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, profile } = await requireAdmin();
    if (!["owner", "admin"].includes(profile.role)) return NextResponse.json({ error: "Only an owner or admin can review and approve." }, { status: 403 });
    const input = schema.parse(await request.json());
    const { id } = await params;
    const { data: video, error } = await supabase.rpc("record_video_review", { p_video_id: id, p_decision: input.decision, p_version_hash: input.versionHash, p_checklist: input.checklist, p_notes: input.notes ?? null });
    if (error) return NextResponse.json({ error: error.message }, { status: 422 });
    return NextResponse.json({ video });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Review failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
