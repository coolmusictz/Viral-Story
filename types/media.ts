export type MediaKind = "upload" | "generated-image" | "generated-video" | "licensed-stock" | "audio" | "caption";
export type RightsStatus = "unknown" | "pending-review" | "licensed" | "owned" | "disallowed";
export type MediaProvider = "user-upload" | "mock" | "stock-source";

export type MediaAsset = {
  id: string;
  name: string;
  kind: MediaKind;
  storagePath: string | null;
  provider: MediaProvider;
  prompt: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  sourceUrl: string | null;
  license: string | null;
  rightsStatus: RightsStatus;
  attribution: string | null;
  creator: string;
  costCents: number;
  previewLabel?: string;
};

export type VoiceSettings = {
  language: "en" | "sw";
  provider: string;
  voiceId: string;
  style: string;
  speed: number;
  pronunciationNotes: string;
  consentConfirmed: boolean;
};

export type SceneAssetAssignment = { sceneId: string; assetId: string };
