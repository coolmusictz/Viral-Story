import { z } from "zod";

export const analyticsEventSchema = z.object({
  eventId: z.string().uuid(),
  videoId: z.string().uuid(),
  kind: z.enum(["impression", "video_start", "watch", "completion", "replay", "like", "share"]),
  watchMs: z.number().int().min(0).max(3_600_000).default(0),
  language: z.enum(["en", "sw"]),
  categoryId: z.string().uuid().nullable().default(null),
  trafficSource: z.enum(["direct", "search", "social", "referral", "unknown"]).default("unknown"),
});
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

export function completionRate(completions: number, starts: number) {
  return starts > 0 ? Math.round((completions / starts) * 1000) / 10 : 0;
}

export function costPerThousandViews(costUsd: number, views: number): number | null {
  return views > 0 ? Math.round((costUsd * 1000 / views) * 100) / 100 : null;
}
