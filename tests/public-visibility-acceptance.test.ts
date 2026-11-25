import { describe, expect, it } from "vitest";
import { getPublishedStoryBySlug, listPublishedStories } from "@/lib/repositories/story-repository";

describe("public visibility acceptance", () => {
  it("never returns drafts or review stories from the public listing", async () => {
    const stories = await listPublishedStories();
    expect(stories.every((story) => story.status === "published")).toBe(true);
    expect(stories.some((story) => story.slug === "the-rain-remembers")).toBe(false);
  });

  it("returns not found for a non-published story slug", async () => {
    await expect(getPublishedStoryBySlug("the-rain-remembers")).resolves.toBeNull();
  });

  it("keeps language filters within published stories", async () => {
    const swStories = await listPublishedStories({ language: "sw" });
    expect(swStories.every((story) => story.status === "published" && story.language === "sw")).toBe(true);
  });
});
