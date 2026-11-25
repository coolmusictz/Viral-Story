import type { MediaAsset } from "@/types/media";

export type ImageGenerationRequest = { prompt: string; width: number; height: number; sceneId: string };
export type GeneratedImage = Pick<MediaAsset, "storagePath" | "provider" | "prompt" | "width" | "height" | "costCents">;
export interface ImageGenerationAdapter {
  readonly provider: string;
  generateImage(request: ImageGenerationRequest): Promise<GeneratedImage>;
}

export type SpeechRequest = { text: string; language: "en" | "sw"; voiceId: string; style: string; speed: number; pronunciationNotes: string };
export type SpeechResult = Pick<MediaAsset, "storagePath" | "provider" | "durationSeconds" | "costCents">;
export interface TextToSpeechAdapter {
  readonly provider: string;
  synthesize(request: SpeechRequest): Promise<SpeechResult>;
  preview(request: SpeechRequest): Promise<{ previewUrl: string | null; label: string }>;
}

export const mockImageAdapter: ImageGenerationAdapter = {
  provider: "mock",
  async generateImage(request) {
    return { storagePath: null, provider: "mock", prompt: request.prompt, width: request.width, height: request.height, costCents: 0 };
  },
};

export const mockSpeechAdapter: TextToSpeechAdapter = {
  provider: "mock",
  async synthesize() {
    return { storagePath: null, provider: "mock", durationSeconds: null, costCents: 0 };
  },
  async preview() {
    return { previewUrl: null, label: "No TTS provider configured. Browser preview is device-local only." };
  },
};

// Provider adapters must be implemented only after credentials, commercial terms,
// data retention, voice rights and language quality have been reviewed.
export function getImageAdapter(): ImageGenerationAdapter {
  return mockImageAdapter;
}
export function getSpeechAdapter(): TextToSpeechAdapter {
  return mockSpeechAdapter;
}
