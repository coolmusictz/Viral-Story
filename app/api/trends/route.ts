import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";

const manualTrendSchema = z.object({ title: z.string().min(3).max(300), sourceUrl: z.string().url(), publisher: z.string().min(2).max(160), summary: z.string().max(2000).optional(), language: z.enum(["en", "sw", "mixed"]).optional(), categoryId: z.string().uuid().optional() });

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = manualTrendSchema.parse(await request.json());
    const supabase = (await import("@/server/supabase/server")).createSupabaseServerClient;
    void supabase;
    return NextResponse.json({ ok: true, status: "received", message: "Validated manual trend. Database insert is ready once a Supabase project is configured.", item: body }, { status: 202 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400 });
  }
}
