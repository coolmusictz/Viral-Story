import { mockStories } from "@/lib/mock-stories";
import type { Story, StoryFilters } from "@/types/story";

// Repository boundary: replace these functions with Supabase queries later.
// Publication visibility is enforced here for every public read.
export async function listPublishedStories(filters: StoryFilters = {}): Promise<Story[]> {
  const query = filters.query?.trim().toLocaleLowerCase();
  const stories = mockStories.filter((story) => {
    if (story.status !== "published") return false;
    if (filters.language && filters.language !== "all" && story.language !== filters.language) return false;
    if (filters.category && story.category.slug !== filters.category) return false;
    if (query && ![story.title.en, story.title.sw, story.synopsis.en, story.synopsis.sw, story.category.label.en, story.category.label.sw].some((value) => value.toLocaleLowerCase().includes(query))) return false;
    return true;
  });

  return stories.sort((a, b) => filters.sort === "popular" ? b.views - a.views : Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export async function getPublishedStoryBySlug(slug: string): Promise<Story | null> {
  return mockStories.find((story) => story.status === "published" && story.slug === slug) ?? null;
}

export async function listPublishedCategories(language: "en" | "sw" = "en") {
  const stories = await listPublishedStories();
  const categories = new Map<string, { slug: string; label: string; count: number }>();
  for (const story of stories) {
    const existing = categories.get(story.category.slug);
    if (existing) existing.count += 1;
    else categories.set(story.category.slug, { slug: story.category.slug, label: story.category.label[language], count: 1 });
  }
  return [...categories.values()];
}
