import { z } from "zod";

export const sceneSchema = z.object({
  position: z.number().int().nonnegative(),
  startSeconds: z.number().nonnegative(),
  endSeconds: z.number().positive(),
  narrationEn: z.string().min(1),
  narrationSw: z.string().min(1),
  onScreenText: z.string(),
  sourceReferences: z.array(z.string().url()),
});

export const aiStorySchema = z.object({
  headline: z.object({ en: z.string().min(1), sw: z.string().min(1) }),
  hook3Seconds: z.object({ en: z.string().min(1), sw: z.string().min(1) }),
  narration: z.object({ en: z.string().min(1), sw: z.string().min(1) }),
  scenes: z.array(sceneSchema).min(1),
  description: z.object({ en: z.string(), sw: z.string() }),
  hashtags: z.array(z.string().regex(/^#[^\s]+$/)).max(10),
  sourceReferences: z.array(z.object({ claim: z.string(), url: z.string().url() })),
  factualityClassification: z.enum(["factual","fictional","mixed"]),
  uncertaintyNotes: z.array(z.string()),
});
export type AiStoryOutput = z.infer<typeof aiStorySchema>;

export type AiGenerationInput = {
  trendTitle: string;
  researchNotes: string;
  verifiedClaims: string[];
  targetAudience: string;
  category: string;
  tone: string;
  targetDuration: number;
};

export type AiProviderAdapter = {
  name: string;
  model: string;
  generate(input: AiGenerationInput): Promise<AiStoryOutput & { inputTokens: number; outputTokens: number; estimatedCostUsd: number }>;
};
