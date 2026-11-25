import type { MetadataRoute } from "next";
import { listPublishedStories } from "@/lib/repositories/story-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stories = await listPublishedStories();
  return [{ url: base, changeFrequency: "daily", priority: 1 }, { url: `${base}/reels`, changeFrequency: "daily", priority: 0.8 }, { url: `${base}/trending`, changeFrequency: "hourly", priority: 0.7 }, { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.6 }, ...stories.map((story) => ({ url: `${base}/story/${story.slug}`, lastModified: new Date(story.publishedAt), changeFrequency: "weekly" as const, priority: 0.7 }))];
}
