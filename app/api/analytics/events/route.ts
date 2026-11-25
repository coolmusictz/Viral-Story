import { NextResponse } from "next/server";
import { analyticsEventSchema } from "@/lib/analytics/analytics-policy";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function POST(request: Request) {
  const parsed = analyticsEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("ingest_video_analytics_event", {
      p_event_id: parsed.data.eventId,
      p_video_id: parsed.data.videoId,
      p_event_kind: parsed.data.kind,
      p_watch_ms: parsed.data.watchMs,
      p_language: parsed.data.language,
      p_category_id: parsed.data.categoryId,
      p_traffic_source: parsed.data.trafficSource,
    });
    if (error) return NextResponse.json({ error: "Analytics currently unavailable." }, { status: 503 });
    return NextResponse.json({ accepted: true, duplicate: data === false }, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Analytics is not configured." }, { status: 503 });
  }
}
