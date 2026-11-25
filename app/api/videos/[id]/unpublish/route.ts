import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";
const schema = z.object({ reason: z.string().min(5).max(1000) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, profile } = await requireAdmin();
    if (!["owner", "admin"].includes(profile.role)) return NextResponse.json({ error: "Owner/admin publisher role required." }, { status: 403 });
    const { reason } = schema.parse(await request.json());
    const { id } = await params;
    const { data, error } = await supabase.rpc("unpublish_video", { p_video_id: id, p_reason: reason });
    if (error) return NextResponse.json({ error: error.message }, { status: 422 });
    return NextResponse.json({ video: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Takedown failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
