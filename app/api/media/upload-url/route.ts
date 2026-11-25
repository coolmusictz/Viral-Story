import { NextResponse } from "next/server";
import { uploadRequestSchema } from "@/lib/media/asset-policy";
import { requireAdmin } from "@/server/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { supabase, profile } = await requireAdmin();
    if (!["owner", "admin", "editor", "producer"].includes(profile.role)) {
      return NextResponse.json({ error: "Your role cannot upload media." }, { status: 403 });
    }
    const input = uploadRequestSchema.parse(await request.json());
    const safeName = input.fileName.replace(/[^\w.()-]+/g, "-").slice(0, 100);
    const objectPath = `quarantine/${crypto.randomUUID()}/${safeName}`;
    const { data, error } = await supabase.storage.from("media-quarantine").createSignedUploadUrl(objectPath, { upsert: false });
    if (error) return NextResponse.json({ error: "Could not create a signed upload URL. Check private bucket configuration." }, { status: 503 });
    return NextResponse.json({ path: data.path, token: data.token, signedUrl: data.signedUrl, contentType: input.contentType, sizeBytes: input.sizeBytes, status: "quarantined-pending-scan" }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload request failed";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
