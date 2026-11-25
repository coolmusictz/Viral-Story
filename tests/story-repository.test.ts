import { describe, expect, it } from "vitest";
import { getPublishedStoryBySlug, listPublishedStories } from "@/lib/repositories/story-repository";

describe("public story repository", () => {
  it("only returns published stories for listings, search, and category filters", async () => {
    const all = await listPublishedStories();
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((story) => story.status === "published")).toBe(true);
    expect((await listPublishedStories({ query: "rain" })).map((story) => story.slug)).toEqual([]);
    expect((await listPublishedStories({ category: "mystery" })).every((story) => story.category.slug === "mystery")).toBe(true);
  });

  it("does not expose unpublished stories by slug", async () => {
    expect(await getPublishedStoryBySlug("the-rain-remembers")).toBeNull();
    expect((await getPublishedStoryBySlug("last-matatu-kariakoo"))?.status).toBe("published");
  });
});
