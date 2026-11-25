import Parser from "rss-parser";
import type { TrendInput } from "@/types/trends";
import { normalizeUrl } from "@/server/trends/trend-service";

export type IngestionResult = { status: "mock" | "ready" | "failed"; adapter: "rss" | "mock"; items: TrendInput[]; error?: string };

export async function ingestRssAllowlisted(feedUrl: string): Promise<IngestionResult> {
  const allowlist = (process.env.TREND_ALLOWLIST ?? "").split(",").map((url) => url.trim()).filter(Boolean);
  if (!allowlist.includes(feedUrl) || !feedUrl.startsWith("https://")) throw new Error("Source is not in the HTTPS allowlist.");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return { status: "mock", adapter: "mock", items: mockItems() };
  try {
    const timeout = Number(process.env.TREND_FETCH_TIMEOUT_MS ?? 8000);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const parser = new Parser({ customFields: { item: ["dc:publisher"] } });
    const response = await fetch(feedUrl, { signal: controller.signal, headers: { "User-Agent": "ViralStory-Feed-Reader/1.0" } });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
    const feed = await parser.parseString(await response.text());
    const items = feed.items.slice(0, 50).map((item) => ({ sourceUrl: normalizeUrl(item.link ?? feedUrl), publisher: feed.title ?? "Unknown publisher", title: item.title ?? "Untitled", summary: item.contentSnippet ?? item.summary ?? undefined, publishedAt: item.isoDate ?? item.pubDate ?? undefined }));
    return { status: "ready", adapter: "rss", items };
  } catch (error) {
    return { status: "failed", adapter: "rss", items: mockItems(), error: error instanceof Error ? error.message : "Unknown feed error" };
  }
}

function mockItems(): TrendInput[] {
  return [{ sourceUrl: "https://example.org/2026/mock-trend", publisher: "Mock licensed feed", title: "Local story network expands in Dar es Salaam", summary: "Clearly labelled demo RSS item.", language: "en", publishedAt: new Date().toISOString() }];
}
