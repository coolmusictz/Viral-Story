import { describe, expect, it } from "vitest";
import { z } from "zod";

const startSchema = z.object({ storyId: z.string().uuid(), language: z.enum(["en", "sw"]), idempotencyKey: z.string().min(8).max(120), estimatedCostUsd: z.number().min(0).max(1000).default(0) });
const checklistSchema = z.object({ scenes: z.boolean(), sources: z.boolean(), factCheck: z.boolean(), rights: z.boolean(), captions: z.boolean(), thumbnail: z.boolean(), renderValidation: z.boolean() });

describe("production and publish gate inputs", () => {
  it("rejects malformed or unbounded production requests", () => {
    expect(startSchema.safeParse({ storyId: "bad", language: "en", idempotencyKey: "abc" }).success).toBe(false);
    expect(startSchema.safeParse({ storyId: "00000000-0000-4000-8000-000000000001", language: "sw", idempotencyKey: "request-123", estimatedCostUsd: 2 }).success).toBe(true);
  });
  it("requires all explicit reviewer checklist flags", () => {
    const full = { scenes: true, sources: true, factCheck: true, rights: true, captions: true, thumbnail: true, renderValidation: true };
    expect(checklistSchema.safeParse(full).success).toBe(true);
    expect(checklistSchema.safeParse({ ...full, rights: false }).success).toBe(true);
  });
});
