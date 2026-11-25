import { describe, expect, it } from "vitest";
import { normalizeUrl, similarityReview, scoreTrend } from "@/server/trends/trend-service";
import { generateValidatedStory } from "@/server/ai/story-service";

describe("trend and AI backend safeguards", () => {
  it("normalizes tracking URLs for deduplication", () => {
    expect(normalizeUrl("https://WWW.Example.org/story/?utm_source=x#top")).toBe("https://example.org/story/");
  });
  it("reviews likely similar titles without silently deleting", () => {
    expect(similarityReview("Dar night buses return", "Dar night buses are back")).toBeGreaterThan(0.4);
  });
  it("returns a labelled estimate score breakdown", () => {
    const result = scoreTrend({ sourceUrl: "https://example.org/a", publisher: "Example", title: "Topic", publishedAt: new Date().toISOString(), sourceCount: 2, categoryRelevance: 0.8, geographyLanguageFit: 0.9 });
    expect(result.estimate).toBe(true);
    expect(Object.values(result.breakdown).length).toBe(5);
  });
  it("validates mock AI output through a schema", async () => {
    const result = await generateValidatedStory({ trendTitle: "Mock topic", researchNotes: "No factual claims", verifiedClaims: [], targetAudience: "Tanzania", category: "Mystery", tone: "cinematic", targetDuration: 42, factualityMode: "fictional", sources: [], claims: [] });
    expect("provider" in result).toBe(true);
  });
});
