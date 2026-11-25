import { aiStorySchema, type AiGenerationInput, type AiProviderAdapter, type AiStoryOutput } from "@/server/ai/types";
import { assertFactualInputHasEvidence, buildEditorialPrompt, PROMPT_VERSION, validateEditorialOutput } from "@/server/ai/editorial-prompts";

export function getAiProvider(): AiProviderAdapter {
  if ((process.env.AI_PROVIDER ?? "mock") !== "mock") {
    return { name: process.env.AI_PROVIDER ?? "external", model: process.env.AI_PROVIDER_MODEL ?? "configured-model", async generate() { throw new Error("External AI adapter is not configured. Mock mode is the only supported provider until credentials and terms are reviewed."); } };
  }
  return {
    name: "mock", model: "mock-editorial-preview-v2",
    async generate(input: AiGenerationInput) {
      const fictional = input.factualityMode !== "factual";
      const output: AiStoryOutput = {
        headline: { en: fictional ? `Fictional story: ${input.trendTitle}` : `Research brief: ${input.trendTitle}`, sw: fictional ? `Hadithi ya kubuni: ${input.trendTitle}` : `Muhtasari wa utafiti: ${input.trendTitle}` },
        hook3Seconds: { en: "What can the supplied evidence actually tell us?", sw: "Ushahidi uliopo unatuambia nini hasa?" },
        narration: { en: fictional ? "This clearly labelled mock fiction is not a factual account." : "This is a research-only preview, not a publishable factual script. Human editorial review is required.", sw: fictional ? "Hii ni hadithi ya mfano ya kubuni, si simulizi la ukweli." : "Huu ni mfano wa utafiti tu, si hati ya ukweli iliyo tayari kuchapishwa. Ukaguzi wa mhariri unahitajika." },
        scenes: [{ position: 0, startSeconds: 0, endSeconds: input.targetDuration, narrationEn: "Illustrative placeholder only; no factual scene has been invented.", narrationSw: "Kielelezo cha mfano tu; hakuna tukio la ukweli lililobuniwa.", onScreenText: fictional ? "FICTIONAL MOCK" : "RESEARCH PREVIEW", sourceReferences: [], visualConcept: "Abstract editorial placeholder, no real person depicted.", imagePrompt: "Non-identifiable symbolic illustration; do not render text.", cameraMovement: "Static frame", transition: "Cut", soundDesign: "No audio asset attached", rightsNote: "Placeholder only; rights and asset approval required." }],
        description: { en: "Mock provider output. Not a verified factual story.", sw: "Matokeo ya mfano. Si hadithi ya ukweli iliyothibitishwa." },
        hashtags: ["#VIRALSTORYAI"],
        sourceReferences: input.sources,
        claims: [],
        factualityClassification: fictional ? "fictional" : "factual",
        uncertaintyNotes: fictional ? ["Fictional mock content; do not present as real events."] : ["Mock provider cannot verify sources or establish facts. Human research and fact-check required."],
        estimatedDurationSeconds: input.targetDuration,
        onScreenText: { en: ["Research preview"], sw: ["Mfano wa utafiti"] },
        labeling: { en: fictional ? "Fictional story" : "Unverified research preview", sw: fictional ? "Hadithi ya kubuni" : "Mfano wa utafiti ambao haujathibitishwa" },
      };
      return { ...output, inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0 };
    },
  };
}

export async function generateValidatedStory(input: AiGenerationInput) {
  const evidenceBlockers = assertFactualInputHasEvidence(input);
  if (evidenceBlockers.length) return { status: "needs-more-evidence" as const, blockers: evidenceBlockers };
  const provider = getAiProvider();
  const raw = await provider.generate(input, buildEditorialPrompt("scriptEn", input));
  const parsed = aiStorySchema.safeParse(raw);
  if (!parsed.success) throw new Error(`AI provider returned invalid structured output: ${parsed.error.message}`);
  const editorialIssues = validateEditorialOutput(input, parsed.data);
  if (editorialIssues.length) return { status: "needs-human-review" as const, blockers: editorialIssues, output: parsed.data };
  return { status: "needs-human-review" as const, blockers: [], output: parsed.data, provider: provider.name, model: provider.model, inputTokens: raw.inputTokens, outputTokens: raw.outputTokens, estimatedCostUsd: raw.estimatedCostUsd, promptVersion: PROMPT_VERSION };
}
