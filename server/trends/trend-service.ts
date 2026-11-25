import type { TrendInput, TrendScore } from "@/types/trends";

export function normalizeUrl(url: string) {
  const parsed = new URL(url);
  parsed.hash = "";
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"]) parsed.searchParams.delete(key);
  parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
  parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  return parsed.toString();
}

export function similarityReview(a: string, b: string) {
  const tokens = (value: string) => new Set(value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((word) => word.length > 2));
  const left = tokens(a), right = tokens(b);
  const union = new Set([...left, ...right]);
  const intersection = [...left].filter((word) => right.has(word)).length;
  return union.size ? intersection / union.size : 0;
}

export function scoreTrend(input: TrendInput & { sourceCount?: number; engagement?: number; categoryRelevance?: number; geographyLanguageFit?: number }): TrendScore {
  const ageHours = input.publishedAt ? Math.max(0, (Date.now() - Date.parse(input.publishedAt)) / 36e5) : 168;
  const recency = Math.max(0, 30 - ageHours * 0.25);
  const sourceCount = Math.min(20, (input.sourceCount ?? 1) * 5);
  const engagement = Math.min(20, (input.engagement ?? 0) * 20);
  const categoryRelevance = Math.min(20, (input.categoryRelevance ?? 0.5) * 20);
  const geographyLanguage = Math.min(10, (input.geographyLanguageFit ?? 0.5) * 10);
  const breakdown = { recency: Math.round(recency), sourceCount, engagement: Math.round(engagement), categoryRelevance: Math.round(categoryRelevance), geographyLanguage: Math.round(geographyLanguage) };
  const total = Math.min(100, Object.values(breakdown).reduce((sum, value) => sum + value, 0));
  return { total: Math.round(total), estimate: true, breakdown };
}
