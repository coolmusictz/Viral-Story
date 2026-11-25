import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";

const rssSchema = z.object({ feedUrl: z.string().url().startsWith("https://") });

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { feedUrl } = rssSchema.parse(await request.json());
    const { ingestRssAllowlisted } = await import("@/server/trends/rss-service");
    const result = await ingestRssAllowlisted(feedUrl);
    return NextResponse.json(result, { status: result.status === "failed" ? 502 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Feed ingestion failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : message.includes("allowlist") ? 400 : 422 });
  }
}
