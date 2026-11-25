import { z } from "zod";

export const voiceSettingsSchema = z.object({
  language: z.enum(["en", "sw"]),
  provider: z.string().min(1).max(80),
  voiceId: z.string().min(1).max(120),
  style: z.string().min(1).max(80),
  speed: z.number().min(0.7).max(1.3),
  pronunciationNotes: z.string().max(1000),
  consentConfirmed: z.boolean(),
});

export const speechGenerationSchema = z.object({
  text: z.string().min(1).max(5000),
  settings: voiceSettingsSchema,
  voiceIsRealPerson: z.boolean().default(false),
  permissionConfirmed: z.boolean().default(false),
}).superRefine((value, context) => {
  if (value.voiceIsRealPerson && !value.permissionConfirmed) {
    context.addIssue({ code: "custom", path: ["permissionConfirmed"], message: "Documented permission is required for a real person's voice." });
  }
});
