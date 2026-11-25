export type ProductionStage = "queued" | "validating" | "preparing-scenes" | "voice" | "captions" | "rendering" | "validating-output" | "uploading" | "completed" | "failed" | "cancelled";
export type RenderCodec = "h264";

export type RenderScene = {
  sceneId: string;
  imageStoragePath: string;
  voiceStoragePath: string;
  captionText: string;
  durationSeconds: number;
};

export type RenderInput = {
  jobId: string;
  storyId: string;
  language: "en" | "sw";
  scenes: RenderScene[];
  musicStoragePath?: string;
  musicRightsCleared: boolean;
  captionFontPath?: string;
};

export type RenderMetadata = {
  width: 1080;
  height: 1920;
  aspectRatio: "9:16";
  codec: RenderCodec;
  durationSeconds: number;
  frameRate: number;
  audioSampleRate: number;
  validation: { blackFrameCount: number; audioVideoSyncDeltaSeconds: number; missingAssetCount: number };
};

export type PublishingReadiness = {
  ready: boolean;
  blockers: string[];
  versionHash: string | null;
};
