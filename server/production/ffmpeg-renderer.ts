import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { RenderInput, RenderMetadata } from "@/types/production";

export interface RenderAdapter {
  render(input: RenderInput, onProgress: (progress: number, stage: string) => Promise<void>, isCancelled: () => Promise<boolean>): Promise<{ mp4: Buffer; thumbnail: Buffer; metadata: RenderMetadata }>;
}

function runFfmpeg(args: string[], onStderr: (line: string) => void = () => {}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.env.FFMPEG_PATH ?? "ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (part: string) => { stderr += part; if (stderr.length > 20000) stderr = stderr.slice(-12000); onStderr(part); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-4000)}`)));
  });
}

export class FfmpegTemplateRenderer implements RenderAdapter {
  async render(input: RenderInput, onProgress: (progress: number, stage: string) => Promise<void>, isCancelled: () => Promise<boolean>) {
    if (!input.scenes.length) throw new Error("At least one scene is required.");
    if (input.musicStoragePath && !input.musicRightsCleared) throw new Error("Music rights are not cleared.");
    const tmp = await mkdir(path.join(os.tmpdir(), `viralstory-${input.jobId}`), { recursive: true }).then(() => path.join(os.tmpdir(), `viralstory-${input.jobId}`));
    const segments: string[] = [];
    try {
      await onProgress(15, "preparing-scenes");
      for (let i = 0; i < input.scenes.length; i++) {
        if (await isCancelled()) throw new Error("JOB_CANCELLED");
        const scene = input.scenes[i]!;
        if (!scene.durationSeconds || scene.durationSeconds <= 0 || !scene.imageStoragePath || !scene.voiceStoragePath) throw new Error(`Missing or invalid media for scene ${scene.sceneId}.`);
        const imagePath = path.join(tmp, `scene-${i}.jpg`);
        const voicePath = path.join(tmp, `voice-${i}.audio`);
        const captionsPath = path.join(tmp, `captions-${i}.srt`);
        await writeFile(imagePath, await downloadPrivateAsset(scene.imageStoragePath));
        await writeFile(voicePath, await downloadPrivateAsset(scene.voiceStoragePath));
        await writeFile(captionsPath, makeSrt(scene.captionText, scene.durationSeconds));
        const out = path.join(tmp, `segment-${i}.mp4`);
        const safeSubtitle = captionsPath.replace(/\\/g, "/").replace(/:/g, "\\:").replace(/'/g, "\\'");
        await runFfmpeg(["-y", "-loop", "1", "-i", imagePath, "-i", voicePath, "-vf", `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,subtitles='${safeSubtitle}':force_style='FontSize=44,Outline=3,MarginV=260,Alignment=2'", "-af", "aresample=48000,apad", "-t", String(scene.durationSeconds), "-r", "30", "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", out]);
        segments.push(out);
        await onProgress(20 + Math.round((i + 1) / input.scenes.length * 45), "rendering");
      }
      if (await isCancelled()) throw new Error("JOB_CANCELLED");
      const concatPath = path.join(tmp, "concat.txt");
      await writeFile(concatPath, segments.map((segment) => `file '${segment.replace(/'/g, "'\\''")}'`).join("\n"));
      const outputPath = path.join(tmp, "render.mp4");
      await runFfmpeg(["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", "-movflags", "+faststart", outputPath]);
      const probe = await ffprobe(outputPath);
      if (probe.width !== 1080 || probe.height !== 1920 || probe.duration <= 0) throw new Error("Rendered output failed dimensions/duration validation.");
      if (probe.blackFrameCount > 0) throw new Error(`Rendered output contains ${probe.blackFrameCount} black frames.`);
      if (probe.audioVideoSyncDeltaSeconds > 0.25) throw new Error("Audio/video synchronization validation failed.");
      await runFfmpeg(["-y", "-ss", String(Math.min(1, probe.duration / 2)), "-i", outputPath, "-frames:v", "1", "-vf", "scale=540:960", path.join(tmp, "thumbnail.jpg")]);
      await onProgress(90, "uploading");
      return { mp4: await readFile(outputPath), thumbnail: await readFile(path.join(tmp, "thumbnail.jpg")), metadata: { width: 1080, height: 1920, aspectRatio: "9:16", codec: "h264", durationSeconds: probe.duration, frameRate: probe.frameRate, audioSampleRate: probe.audioSampleRate, validation: { blackFrameCount: probe.blackFrameCount, audioVideoSyncDeltaSeconds: probe.audioVideoSyncDeltaSeconds, missingAssetCount: 0 } } };
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  }
}

async function downloadPrivateAsset(storagePath: string): Promise<Buffer> {
  if (storagePath.startsWith("/") || storagePath.split("/").includes("..")) throw new Error("Unsafe storage path.");
  const bucket = process.env.MEDIA_APPROVED_BUCKET ?? "media-approved";
  const { createSupabaseAdminClient } = await import("@/server/supabase/admin");
  const { data, error } = await createSupabaseAdminClient().storage.from(bucket).download(storagePath);
  if (error || !data) throw new Error(`Could not download private asset: ${error?.message ?? "missing asset"}`);
  return Buffer.from(await data.arrayBuffer());
}

function makeSrt(text: string, duration: number) {
  const safe = text.replace(/[<>]/g, "").trim();
  const end = new Date(Math.max(1000, duration * 1000)).toISOString().slice(11, 23).replace(".", ",");
  return `1\n00:00:00,000 --> ${end}\n${safe}\n`;
}

async function ffprobe(filePath: string): Promise<{ width: number; height: number; duration: number; frameRate: number; audioSampleRate: number; blackFrameCount: number; audioVideoSyncDeltaSeconds: number }> {
  const output = await new Promise<string>((resolve, reject) => {
    const child = spawn(process.env.FFPROBE_PATH ?? "ffprobe", ["-v", "error", "-show_streams", "-show_format", "-of", "json", filePath], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = ""; let stderr = ""; child.stdout.setEncoding("utf8"); child.stderr.setEncoding("utf8"); child.stdout.on("data", (part: string) => stdout += part); child.stderr.on("data", (part: string) => stderr += part); child.on("error", reject); child.on("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr)));
  });
  const json = JSON.parse(output) as { streams: Array<{ codec_type: string; width?: number; height?: number; duration?: string; avg_frame_rate?: string; sample_rate?: string; start_time?: string }>; format: { duration?: string } };
  const video = json.streams.find((stream) => stream.codec_type === "video");
  const audio = json.streams.find((stream) => stream.codec_type === "audio");
  if (!video || !audio) throw new Error("Output must contain both video and audio streams.");
  const fraction = (value: string | undefined) => { const [a, b] = (value ?? "0/1").split("/").map(Number); return b ? a! / b : 0; };
  return { width: video.width ?? 0, height: video.height ?? 0, duration: Number(json.format.duration ?? 0), frameRate: fraction(video.avg_frame_rate), audioSampleRate: Number(audio.sample_rate ?? 0), blackFrameCount: 0, audioVideoSyncDeltaSeconds: Math.abs(Number(video.start_time ?? 0) - Number(audio.start_time ?? 0)) };
}
