import { z } from "zod";
import type { MediaAsset, RightsStatus } from "@/types/media";

export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
export const acceptedUploadTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "audio/mpeg", "audio/wav", "audio/mp4", "text/vtt"] as const;

export const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(180).regex(/^[\w .()\-]+$/),
  contentType: z.enum(acceptedUploadTypes),
  sizeBytes: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  sceneId: z.string().uuid().optional(),
});

export function canEnterProduction(assets: Pick<MediaAsset, "rightsStatus">[]) {
  return assets.every((asset) => asset.rightsStatus === "licensed" || asset.rightsStatus === "owned");
}

export function isRightsStatus(value: string): value is RightsStatus {
  return ["unknown", "pending-review", "licensed", "owned", "disallowed"].includes(value);
}

export function createMockAsset(input: { name: string; kind: MediaAsset["kind"]; creator: string }): MediaAsset {
  return {
    id: `mock-${crypto.randomUUID()}`,
    name: input.name,
    kind: input.kind,
    storagePath: null,
    provider: input.kind === "licensed-stock" ? "stock-source" : "mock",
    prompt: input.kind.startsWith("generated-") ? "Demo placeholder; no generation provider configured." : null,
    width: input.kind.includes("image") || input.kind === "licensed-stock" ? 1080 : null,
    height: input.kind.includes("image") || input.kind === "licensed-stock" ? 1920 : null,
    durationSeconds: input.kind.includes("video") || input.kind === "audio" ? 0 : null,
    sourceUrl: null,
    license: null,
    rightsStatus: "unknown",
    attribution: null,
    creator: input.creator,
    costCents: 0,
    previewLabel: "Mock placeholder · not a usable media file",
  };
}
