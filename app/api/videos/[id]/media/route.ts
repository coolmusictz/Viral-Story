import { NextResponse } from "next/server";
import { createSupabaseServerClient, requireAdmin } from "@/server/supabase/server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: video, error } = await supabase.from("videos").select("status,storage_path,thumbnail_path").eq("id", id).maybeSingle();
    if (error || !video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    let isAuthorizedPublic = video.status === "published";
    if (!isAuthorizedPublic) {
      try {
        const { profile } = await requireAdmin();
        isAuthorizedPublic = ["owner", "admin", "producer"].includes(profile.role);
      } catch { isAuthorizedPublic = false; }
    }
    if (!isAuthorizedPublic) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const urlPath = new URL(_request.url).searchParams.get("kind") === "thumbnail" ? video.thumbnail_path : video.storage_path;
    if (!urlPath) return NextResponse.json({ error: "Media not found" }, { status: 404 });
    const { data, error: signError } = await supabase.storage.from(process.env.MEDIA_APPROVED_BUCKET ?? "media-approved").createSignedUrl(urlPath, 60);
    if (signError || !data) return NextResponse.json({ error: "Media unavailable" }, { status: 503 });
    return NextResponse.redirect(data.signedUrl, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Media unavailable" }, { status: 503 });
  }
}
