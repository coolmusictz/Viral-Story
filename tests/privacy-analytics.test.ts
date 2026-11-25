import { describe, expect, it } from "vitest";
import { completionRate, costPerThousandViews } from "@/lib/analytics/analytics-policy";
import { rankForYou } from "@/lib/repositories/for-you-ranking";

describe("privacy analytics calculations", () => {
  it("calculates completion rate safely", () => {
    expect(completionRate(25, 100)).toBe(25);
    expect(completionRate(1, 0)).toBe(0);
  });
  it("avoids a misleading cost-per-thousand when there are no views", () => {
    expect(costPerThousandViews(2, 0)).toBeNull();
    expect(costPerThousandViews(2, 1000)).toBe(2);
  });
  it("ranks published stories deterministically and exposes its score parts", async () => {
    const ranked = await rankForYou({ now: Date.parse("2026-11-25T00:00:00Z"), preferredCategory: "mystery" });
    expect(ranked.every((story) => story.status === "published")).toBe(true);
    expect(ranked[0]?.ranking.label).toBe("transparent-editorial-ranking");
    expect(ranked[0]?.ranking).toHaveProperty("recency");
  });
});
