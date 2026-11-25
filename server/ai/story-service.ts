import { aiStorySchema, type AiGenerationInput, type AiProviderAdapter, type AiStoryOutput } from "@/server/ai/types";

export function getAiProvider(): AiProviderAdapter {
  if ((process.env.AI_PROVIDER ?? "mock") !== "mock" && process.env.AI_PROVIDER_API_KEY) {
    return { name: process.env.AI_PROVIDER ?? "external", model: process.env.AI_PROVIDER_MODEL ?? "configured-model", async generate() { throw new Error("External AI adapter not configured. Set AI_PROVIDER=mock or implement the provider integration."); } };
  }
  return {
    name: "mock", model: "mock-structured-v1",
    async generate(input: AiGenerationInput) {
      const output: AiStoryOutput = {
        headline: { en: `A short story: ${input.trendTitle}`, sw: `Hadithi fupi: ${input.trendTitle}` },
        hook3Seconds: { en: "The next detail changes everything.", sw: "Maelezo yanayofuata hubadilisha kila kitu." },
        narration: { en: "This is a mock bilingual story generated from approved notes.", sw: "Hii ni hadithi ya mfano ya lugha mbili inayotokana na maelezo yaliyoidhinishwa." },
        scenes: [{ position: 0, startSeconds: 0, endSeconds: input.targetDuration, narrationEn: "A fictional preview scene.", narrationSw: "Tukio la onyesho la mfano.", onScreenText: "MOCK STORY", sourceReferences: [] }],
        description: { en: "A short-form mock story description.", sw: "Maelezo mafupi ya hadithi ya mfano." },
        hashtags: ["#ViralStory", "#Tanzania"],
        sourceReferences: [],
        factualityClassification: input.verifiedClaims.length ? "mixed" : "fictional",
        uncertaintyNotes: input.verifiedClaims.length ? ["Verify every named factual detail before production."] : ["No factual claims were approved; fictional framing remains required."],
      };
      aiStorySchema.parse(output);
      return { ...output, inputTokens: 500, outputTokens: 300, estimatedCostUsd: 0 };
    },
  };
}

export async function generateValidatedStory(input: AiGenerationInput) {
  const provider = getAiProvider();
  const raw = await provider.generate(input);
  const parsed = aiStorySchema.safeParse(raw);
  if (!parsed.success) throw new Error(`AI provider returned invalid structured output: ${parsed.error.message}`);
  return { ...parsed.data, provider: provider.name, model: provider.model, inputTokens: raw.inputTokens, outputTokens: raw.outputTokens, estimatedCostUsd: raw.estimatedCostUsd, promptVersion: "viral-story/story-v1" };
}
