export type StoryLanguage = "en" | "sw";
export type StoryStatus = "draft" | "review" | "published";

export type Story = {
  id: string;
  slug: string;
  status: StoryStatus;
  title: Record<StoryLanguage, string>;
  synopsis: Record<StoryLanguage, string>;
  caption: Record<StoryLanguage, string>;
  language: StoryLanguage;
  category: { slug: string; label: Record<StoryLanguage, string> };
  durationSeconds: number;
  publishedAt: string;
  views: number;
  featured: boolean;
  poster: { gradient: string; motif: string };
  videoUrl: string | null;
};

export type StoryFilters = {
  language?: StoryLanguage | "all";
  category?: string;
  query?: string;
  sort?: "latest" | "popular";
};
