import { describe, expect, it } from "vitest";
import { canEnterProduction, MAX_UPLOAD_BYTES, uploadRequestSchema } from "@/lib/media/asset-policy";
import { speechGenerationSchema } from "@/server/media/voice-validation";

describe("media policy", () => {
  it("blocks production for unknown, pending and disallowed assets", () => {
    expect(canEnterProduction([{ rightsStatus: "licensed" }, { rightsStatus: "owned" }])).toBe(true);
    expect(canEnterProduction([{ rightsStatus: "licensed" }, { rightsStatus: "unknown" }])).toBe(false);
    expect(canEnterProduction([{ rightsStatus: "disallowed" }])).toBe(false);
  });

  it("validates file type and a strict size cap", () => {
    expect(uploadRequestSchema.safeParse({ fileName: "poster.png", contentType: "image/png", sizeBytes: 1200 }).success).toBe(true);
    expect(uploadRequestSchema.safeParse({ fileName: "payload.exe", contentType: "application/octet-stream", sizeBytes: 1200 }).success).toBe(false);
    expect(uploadRequestSchema.safeParse({ fileName: "large.mp4", contentType: "video/mp4", sizeBytes: MAX_UPLOAD_BYTES + 1 }).success).toBe(false);
  });

  it("requires consent for imitation of a real person's voice", () => {
    const base = { text: "Habari", settings: { language: "sw", provider: "mock", voiceId: "generic-sw", style: "warm", speed: 1, pronunciationNotes: "" }, voiceIsRealPerson: true };
    expect(speechGenerationSchema.safeParse(base).success).toBe(false);
    expect(speechGenerationSchema.safeParse({ ...base, permissionConfirmed: true }).success).toBe(true);
  });
});
