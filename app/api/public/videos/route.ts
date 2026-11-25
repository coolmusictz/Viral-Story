import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("videos").select("id,story_id,slug,language,alternate_language_video_id,published_at,duration_seconds,codec,thumbnail_path,render_metadata,stories!inner(title_en,title_sw,synopsis_en,synopsis_sw,categories(name_en,name_sw))").eq("status", "published").not("approved_at", "is", null).not("approved_by", "is", null).order("published_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Public videos are temporarily unavailable." }, { status: 503 });
  const videos = (data ?? []).map((video) => ({ id: video.id, slug: video.slug, language: video.language, alternateLanguageVideoId: video.alternate_language_video_id, publishedAt: video.published_at, durationSeconds: video.duration_seconds, codec: video.codec, thumbnailUrl: video.thumbnail_path ? `/api/videos/${video.id}/media?kind=thumbnail` : null, title: video.language === "sw" ? video.stories.title_sw : video.stories.title_en, description: video.language === "sw" ? video.stories.synopsis_sw : video.stories.synopsis_en, canonicalUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/story/${video.slug}`, openGraphImage: video.thumbnail_path ? `/api/videos/${video.id}/media?kind=thumbnail` : null }));
  return NextResponse.json({ videos }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
