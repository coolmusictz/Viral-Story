export type TrendInput = {
  sourceUrl: string;
  publisher: string;
  title: string;
  summary?: string;
  language?: string;
  categoryId?: string;
  publishedAt?: string;
};

export type TrendScore = {
  total: number;
  estimate: true;
  breakdown: {
    recency: number;
    sourceCount: number;
    engagement: number;
    categoryRelevance: number;
    geographyLanguage: number;
  };
};
