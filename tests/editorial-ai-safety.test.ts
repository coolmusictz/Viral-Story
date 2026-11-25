import { describe, expect, it } from "vitest";
import { assertFactualInputHasEvidence, buildEditorialPrompt, PROMPT_VERSION, validateEditorialOutput } from "@/server/ai/editorial-prompts";
import { generateValidatedStory } from "@/server/ai/story-service";
import type { AiGenerationInput } from "@/server/ai/types";

const base: AiGenerationInput = {
  trendTitle: "A supplied topic",
  researchNotes: "Only source text belongs here.",
  verifiedClaims: [],
  targetAudience: "Broad international audience",
  category: "Public interest",
  tone: "Clear and engaging",
  targetDuration: 42,
  factualityMode: "factual",
  sources: [{ id: "src-1", url: "https://example.org/report", title: "Supplied source" }],
  claims: [{ id: "claim-1", statement: "A fact documented in the source.", state: "supported", sourceIds: ["src-1"] }],
};

describe("editorial AI safeguards", () => {
  it("includes the requested editorial constraints in prompt tasks", () => {
    expect(buildEditorialPrompt("scriptEn", base)).toContain("Do not invent dialogue, motives, dates, events");
    expect(buildEditorialPrompt("localizeSw", base)).toContain("natural spoken Tanzanian Kiswahili");
    expect(buildEditorialPrompt("finalCheck", base)).toContain("Return PASS only if all checks pass");
    expect(PROMPT_VERSION).toContain("editorial");
  });

  it("blocks factual generation without source-backed claims", async () => {
    const result = await generateValidatedStory({ ...base, sources: [], claims: [] });
    expect(result.status).toBe("needs-more-evidence");
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("rejects facts linked to unsupplied source IDs", () => {
    const issues = validateEditorialOutput(base, { factualityClassification: "factual", claims: [{ statement: "Unsupported assertion", sourceIds: ["missing"], classification: "verified-fact", uncertaintyNote: null }] });
    expect(issues.length).toBeGreaterThan(0);
  });

  it("labels mock fiction and keeps it out of factual framing", async () => {
    const result = await generateValidatedStory({ ...base, factualityMode: "fictional", claims: [], sources: [] });
    expect(result.status).toBe("needs-human-review");
    if (result.status !== "needs-human-review") throw new Error("Expected generated mock preview");
    expect(result.output?.factualityClassification).toBe("fictional");
    expect(result.output?.labeling.en).toContain("Fiction");
  });
});
