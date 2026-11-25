import { z } from "zod";

export const claimEvidenceStateSchema = z.enum(["supported", "partially-supported", "disputed", "unsupported", "opinion"]);
export const sourceReferenceSchema = z.object({ id: z.string().min(1), url: z.string().url(), title: z.string().optional(), publisher: z.string().optional() });
export const claimLedgerEntrySchema = z.object({ id: z.string().min(1), statement: z.string().min(1), state: claimEvidenceStateSchema, sourceIds: z.array(z.string()), evidenceNotes: z.string().optional() });

export const researchBriefSchema = z.object({
  neutralSummary: z.string(),
  timeline: z.array(z.object({ date: z.string().nullable(), event: z.string(), sourceIds: z.array(z.string()) })),
  claims: z.array(claimLedgerEntrySchema),
  unknownOrContested: z.array(z.string()),
  suitableForPublicInterestStory: z.boolean(),
  cautionNote: z.string(),
  recommendation: z.enum(["proceed-to-human-review", "gather-more-evidence", "do-not-produce-factual-story"]),
});

export const storySceneSchema = z.object({
  position: z.number().int().nonnegative(),
  startSeconds: z.number().nonnegative(),
  endSeconds: z.number().positive(),
  narrationEn: z.string().min(1),
  narrationSw: z.string().min(1),
  onScreenText: z.string(),
  sourceReferences: z.array(z.string().url()),
  visualConcept: z.string(),
  imagePrompt: z.string(),
  cameraMovement: z.string(),
  transition: z.string(),
  soundDesign: z.string(),
  rightsNote: z.string(),
});

export const editorialClaimSchema = z.object({ statement: z.string().min(1), sourceIds: z.array(z.string()), classification: z.enum(["verified-fact", "speculation", "opinion", "dramatization", "fiction"]), uncertaintyNote: z.string().nullable() });

export const aiStorySchema = z.object({
  headline: z.object({ en: z.string().min(1), sw: z.string().min(1) }),
  hook3Seconds: z.object({ en: z.string().min(1), sw: z.string().min(1) }),
  narration: z.object({ en: z.string().min(1), sw: z.string().min(1) }),
  scenes: z.array(storySceneSchema).min(1),
  description: z.object({ en: z.string(), sw: z.string() }),
  hashtags: z.array(z.string().regex(/^#[^\s]+$/)).max(10),
  sourceReferences: z.array(sourceReferenceSchema),
  claims: z.array(editorialClaimSchema),
  factualityClassification: z.enum(["factual", "fictional", "dramatized", "mixed"]),
  uncertaintyNotes: z.array(z.string()),
  estimatedDurationSeconds: z.number().int().min(30).max(90),
  onScreenText: z.object({ en: z.array(z.string()), sw: z.array(z.string()) }),
  labeling: z.object({ en: z.string(), sw: z.string() }),
});
export type AiStoryOutput = z.infer<typeof aiStorySchema>;

export const aiGenerationInputSchema = z.object({
  trendTitle: z.string().min(3).max(300),
  researchNotes: z.string().max(12000),
  verifiedClaims: z.array(z.string().max(1000)).max(100),
  targetAudience: z.string().min(1).max(300),
  category: z.string().min(1).max(120),
  tone: z.string().min(1).max(120),
  targetDuration: z.number().int().min(30).max(90),
  factualityMode: z.enum(["factual", "fictional", "dramatized"]).default("factual"),
  sources: z.array(sourceReferenceSchema).max(100).default([]),
  claims: z.array(claimLedgerEntrySchema).max(100).default([]),
  englishApprovedStory: z.string().max(12000).optional(),
});
export type AiGenerationInput = z.infer<typeof aiGenerationInputSchema>;

export type AiProviderAdapter = {
  name: string;
  model: string;
  generate(input: AiGenerationInput, prompt: string): Promise<AiStoryOutput & { inputTokens: number; outputTokens: number; estimatedCostUsd: number }>;
};

export const hookAlternativesSchema = z.object({ hooks: z.array(z.object({ text: z.string().min(1), wordCount: z.number().int().positive(), strongest: z.boolean(), rationale: z.string() })).length(5) });
export const editorialCheckSchema = z.object({ decision: z.enum(["PASS", "FAIL"]), issues: z.array(z.object({ statement: z.string(), issue: z.string(), correction: z.string() })), rightsIssues: z.array(z.string()), notes: z.array(z.string()) });
export const storyboardOutputSchema = z.object({ scenes: z.array(storySceneSchema).min(5).max(12), totalDurationSeconds: z.number().int().min(30).max(90) });
export const localizedStorySchema = z.object({ title: z.string(), hook: z.string(), narration: z.string(), onScreenText: z.array(z.string()), description: z.string(), hashtags: z.array(z.string()) });
