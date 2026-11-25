import { listPublishedStories } from "@/lib/repositories/story-repository";
import type { Story } from "@/types/story";

export type RankedStory = Story & { ranking: { score: number; recency: number; categoryFit: number; aggregatePerformance: number; label: "transparent-editorial-ranking" } };

// Deterministic demo ranking. Replace aggregatePerformance with privacy-preserving
// published aggregate data later; this is not personalization or AI.
export async function rankForYou(options: { preferredCategory?: string; now?: number } = {}): Promise<RankedStory[]> {
  const stories = await listPublishedStories();
  const now = options.now ?? Date.now();
  return stories.map((story) => {
    const ageDays = Math.max(0, (now - Date.parse(story.publishedAt)) / 86_400_000);
    const recency = Math.max(0, 100 - ageDays * 8);
    const categoryFit = options.preferredCategory ? story.category.slug === options.preferredCategory ? 100 : 0 : 50;
    const aggregatePerformance = Math.min(100, Math.log10(Math.max(1, story.views)) * 20);
    const score = Math.round(recency * 0.4 + categoryFit * 0.2 + aggregatePerformance * 0.4);
    return { ...story, ranking: { score, recency: Math.round(recency), categoryFit, aggregatePerformance: Math.round(aggregatePerformance), label: "transparent-editorial-ranking" as const } };
  }).sort((a, b) => b.ranking.score - a.ranking.score);
}
