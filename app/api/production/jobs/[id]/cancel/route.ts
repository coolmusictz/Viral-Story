import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";
const schema = z.object({ cancel: z.literal(true) });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, profile } = await requireAdmin();
    if (!["owner", "admin", "producer"].includes(profile.role)) return NextResponse.json({ error: "Producer role required." }, { status: 403 });
    schema.parse(await request.json());
    const { id } = await params;
    const { data, error } = await supabase.from("production_jobs").update({ cancel_requested: true }).eq("id", id).in("status", ["queued", "running"]).select("id,status").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Job not found or already finished." }, { status: 404 });
    return NextResponse.json({ job: data, message: "Cancellation requested; worker will stop at the next safe checkpoint." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cancel failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
