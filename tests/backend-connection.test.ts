import { describe, expect, it } from "vitest";
import { normalizeUrl, similarityReview } from "@/server/trends/trend-service";

describe("backend URL safety", () => {
  it("canonicalizes URL duplicates", () => {
    expect(normalizeUrl("https://WWW.Example.com/story/?utm_source=x#part")).toBe("https://example.com/story/");
  });
  it("uses review scores instead of silent deletion", () => {
    expect(similarityReview("Dar buses change routes", "Dar bus routes are changing")).toBeGreaterThan(0.3);
  });
});
