"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { mockAssets } from "@/lib/mock-admin";
import { acceptedUploadTypes, canEnterProduction, createMockAsset, MAX_UPLOAD_BYTES } from "@/lib/media/asset-policy";
import type { MediaAsset, RightsStatus, VoiceSettings } from "@/types/media";

const initialAssets: MediaAsset[] = mockAssets.map((asset) => ({
  id: asset.id,
  name: asset.name,
  kind: asset.kind === "Video" ? "generated-video" : asset.kind === "Audio" ? "audio" : asset.kind === "Poster" ? "generated-image" : "caption",
  storagePath: null,
  provider: "mock",
  prompt: "Demo asset only.",
  width: asset.kind === "Poster" ? 1080 : null,
  height: asset.kind === "Poster" ? 1920 : null,
  durationSeconds: asset.kind === "Video" ? 42 : null,
  sourceUrl: null,
  license: null,
  rightsStatus: "unknown",
  attribution: null,
  creator: "VIRALSTORY AI demo",
  costCents: 0,
  previewLabel: asset.rights,
}));
const initialVoice: VoiceSettings[] = [
  { language: "en", provider: "mock", voiceId: "generic-en-demo", style: "Cinematic, warm", speed: 1, pronunciationNotes: "Keep character names consistent.", consentConfirmed: false },
  { language: "sw", provider: "mock", voiceId: "generic-sw-demo", style: "Kiswahili cha Tanzania, cha kawaida", speed: 1, pronunciationNotes: "Use natural Tanzanian Kiswahili; add names/places needing pronunciation guidance.", consentConfirmed: false },
];

export function AdminMediaWorkflow() {
  const [assets, setAssets] = useState(initialAssets);
  const [voices, setVoices] = useState(initialVoice);
  const [message, setMessage] = useState("");
  const [selectedScene, setSelectedScene] = useState("SC-01");
  const [rightsFilter, setRightsFilter] = useState("all");
  const fileInput = useRef<HTMLInputElement>(null);
  const productionAllowed = useMemo(() => canEnterProduction(assets.filter((asset) => asset.id.startsWith("scene:"))), [assets]);

  function updateVoice(language: "en" | "sw", update: Partial<VoiceSettings>) {
    setVoices((current) => current.map((voice) => voice.language === language ? { ...voice, ...update } : voice));
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    if (!(acceptedUploadTypes as readonly string[]).includes(file.type)) {
      setMessage("Unsupported file type. Use JPEG, PNG, WebP, MP4, MP3, WAV, M4A or VTT.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setMessage("File exceeds the 100 MB upload limit.");
      return;
    }
    const asset = createMockAsset({ name: file.name, kind: file.type.startsWith("video/") ? "generated-video" : file.type.startsWith("audio/") ? "audio" : file.type === "text/vtt" ? "caption" : "upload", creator: "Current mock user" });
    setAssets((current) => [asset, ...current]);
    setMessage(`${file.name} passed client-side checks and was added as a mock placeholder only. No bytes uploaded; server signature and malware scans are not configured.`);
  }

  function previewVoice(language: "en" | "sw") {
    const voice = voices.find((item) => item.language === language)!;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setMessage("This browser does not support local speech preview. No audio provider is configured.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(language === "sw" ? "Habari, hii ni sauti ya majaribio ya mfano." : "Hello, this is a local demo voice preview.");
    utterance.lang = language === "sw" ? "sw-TZ" : "en-US";
    utterance.rate = voice.speed;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setMessage("Voice preview uses a generic voice supplied by your device. It is not a generated asset and does not imitate a real person.");
  }

  function regenerate(language: "en" | "sw") {
    setMessage(`Mock ${language === "sw" ? "Kiswahili" : "English"} voice regeneration requested. No TTS provider is configured and no audio was created.`);
  }

  function assignMockAsset() {
    const assigned = createMockAsset({ name: `${selectedScene}-placeholder`, kind: "generated-image", creator: "VIRALSTORY AI demo" });
    setAssets((current) => [{ ...assigned, id: `scene:${selectedScene}:${assigned.id}` }, ...current]);
    setMessage(`Mock image placeholder assigned to ${selectedScene}. Rights are unknown, so production remains blocked.`);
  }

  const visibleAssets = assets.filter((asset) => rightsFilter === "all" || asset.rightsStatus === rightsFilter);

  return <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8 sm:px-8">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">A07 · MEDIA PRODUCTION</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Scene assets &amp; voice</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Manage asset provenance, rights and per-language voice settings. This mock workflow does not persist data.</p></div><Link href="/admin" className="rounded-md border border-white/10 px-4 py-2.5 text-sm text-paper hover:border-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">← Back to studio</Link></header>
    <div role="status" className="mb-6 rounded-md border border-warning/20 bg-warning/[0.05] p-4 text-sm leading-6 text-warning">Mock authentication · no provider keys · no storage persistence. All demo asset rights begin as unknown and block production.</div>
    {message && <div role="status" className="mb-5 flex items-start justify-between gap-4 rounded-md border border-white/10 bg-surface px-4 py-3 text-sm text-muted"><span>{message}</span><button aria-label="Dismiss message" onClick={() => setMessage("")} className="rounded-sm px-2 text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">×</button></div>}
    <section aria-labelledby="scene-assets-title"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 id="scene-assets-title" className="text-xl font-semibold">Scene media</h2><p className="mt-1 text-sm text-muted">Each storyboard scene supports uploads, generated media or licensed stock.</p></div><div className="flex flex-wrap gap-2"><label htmlFor="scene-select" className="sr-only">Select scene</label><select id="scene-select" value={selectedScene} onChange={(event) => setSelectedScene(event.target.value)} className="min-h-10 rounded-md border border-white/10 bg-surface px-3 text-sm"><option value="SC-01">Scene 01 · The final stop</option><option value="SC-02">Scene 02 · The phone</option><option value="SC-03">Scene 03 · The message</option></select><Button variant="secondary" onClick={() => fileInput.current?.click()}>Upload file</Button><input ref={fileInput} className="sr-only" type="file" accept={acceptedUploadTypes.join(",")} onChange={(event) => { void handleUpload(event.target.files?.[0]); event.currentTarget.value = ""; }}/><Button onClick={assignMockAsset}>Add mock image</Button></div></div>
      <div className="mb-4 grid gap-3 sm:grid-cols-3"><Card><p className="text-xs font-semibold uppercase tracking-wide text-muted">Upload</p><p className="mt-2 text-sm">Private quarantine path</p><p className="mt-1 text-xs text-muted">100 MB max · MIME allowlist</p></Card><Card><p className="text-xs font-semibold uppercase tracking-wide text-muted">AI generation</p><p className="mt-2 text-sm">Image/video provider adapter</p><p className="mt-1 text-xs text-warning">Mock adapter only</p></Card><Card><p className="text-xs font-semibold uppercase tracking-wide text-muted">Licensed stock</p><p className="mt-2 text-sm">Source, license and attribution required</p><p className="mt-1 text-xs text-muted">No stock provider configured</p></Card></div>
      <div className="mb-4 flex items-center justify-between gap-3"><h3 className="font-medium">Asset records</h3><Select label="Rights filter" value={rightsFilter} onChange={(event) => setRightsFilter(event.target.value)} options={[{ value: "all", label: "All rights statuses" }, { value: "unknown", label: "Unknown" }, { value: "pending-review", label: "Pending review" }, { value: "licensed", label: "Licensed" }, { value: "owned", label: "Owned" }, { value: "disallowed", label: "Disallowed" }]}/></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleAssets.map((asset) => <Card key={asset.id}><div className="flex items-start justify-between gap-2"><div className={`grid aspect-[9/10] w-20 shrink-0 place-items-center rounded-md bg-gradient-to-br from-[#4d3025] to-[#141414] text-center text-[10px] text-white/70`}>{asset.previewLabel ?? "PLACEHOLDER"}</div><Badge variant={asset.rightsStatus === "licensed" || asset.rightsStatus === "owned" ? "success" : asset.rightsStatus === "disallowed" ? "danger" : "warning"}>{asset.rightsStatus}</Badge></div><h4 className="mt-4 break-words text-sm font-semibold">{asset.name}</h4><p className="mt-1 text-xs text-muted">{asset.kind} · {asset.provider} · {asset.creator}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><dt className="text-muted">Dimensions</dt><dd className="mt-1">{asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}</dd></div><div><dt className="text-muted">Cost</dt><dd className="mt-1">${(asset.costCents / 100).toFixed(2)}</dd></div></dl><label className="mt-4 block text-xs text-muted">Rights status<select value={asset.rightsStatus} onChange={(event) => setAssets((current) => current.map((item) => item.id === asset.id ? { ...item, rightsStatus: event.target.value as RightsStatus } : item))} className="mt-1 min-h-10 w-full rounded-md border border-white/10 bg-background px-2 text-sm text-paper"><option value="unknown">Unknown</option><option value="pending-review">Pending review</option><option value="licensed">Licensed</option><option value="owned">Owned / original</option><option value="disallowed">Disallowed</option></select></label><div className="mt-3 grid gap-2"><Input label="Source / license note" placeholder="URL, license, attribution" onChange={(event) => setAssets((current) => current.map((item) => item.id === asset.id ? { ...item, license: event.target.value, sourceUrl: event.target.value.startsWith("https://") ? event.target.value : item.sourceUrl } : item))}/><p className="text-[10px] leading-4 text-warning">Demo-only status changes are not persisted or independently verified.</p></div></Card>)}</div>
    </section>
    <section className="mt-12 border-t border-white/10 pt-8" aria-labelledby="voice-title"><div className="mb-5"><h2 id="voice-title" className="text-xl font-semibold">Voice settings</h2><p className="mt-1 text-sm text-muted">Independent settings for English and natural Tanzanian Kiswahili narration.</p></div><div className="grid gap-5 lg:grid-cols-2">{voices.map((voice) => <Card key={voice.language}><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-ember">{voice.language === "sw" ? "KISWAHILI · TANZANIA" : "ENGLISH"}</p><h3 className="mt-1 text-lg font-semibold">{voice.language === "sw" ? "Voice direction" : "Voice settings"}</h3></div><Badge variant="warning">Mock provider</Badge></div><div className="mt-5 grid gap-4"><Input label="Voice ID" value={voice.voiceId} onChange={(event) => updateVoice(voice.language, { voiceId: event.target.value })}/><Input label="Style direction" value={voice.style} onChange={(event) => updateVoice(voice.language, { style: event.target.value })}/><label className="grid gap-2 text-sm font-medium">Speech speed <span className="text-xs text-muted">{voice.speed.toFixed(1)}×</span><input aria-label={`${voice.language} speech speed`} type="range" min="0.7" max="1.3" step="0.1" value={voice.speed} onChange={(event) => updateVoice(voice.language, { speed: Number(event.target.value) })} className="accent-ember"/></label><div><label htmlFor={`notes-${voice.language}`} className="mb-2 block text-sm font-medium">Pronunciation notes</label><textarea id={`notes-${voice.language}`} value={voice.pronunciationNotes} onChange={(event) => updateVoice(voice.language, { pronunciationNotes: event.target.value })} maxLength={1000} className="min-h-24 w-full rounded-md border border-white/10 bg-background p-3 text-sm leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"/></div></div><div className="mt-5 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => previewVoice(voice.language)}>Preview local voice</Button><Button onClick={() => regenerate(voice.language)}>Regenerate audio</Button></div><p className="mt-3 text-xs leading-5 text-muted">Local preview uses the device’s generic speech engine. It does not create, store or imitate a voice. TTS generation is unavailable until provider terms and credentials are approved.</p></Card>)}</div></section>
    <section className="mt-12 rounded-lg border border-danger/20 bg-danger/[0.04] p-5 sm:p-6" aria-labelledby="rights-gate-title"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 id="rights-gate-title" className="font-semibold">Production &amp; publishing rights gate</h2><p className="mt-2 text-sm text-muted">Every assigned scene asset must be licensed or owned. Unknown, pending or disallowed rights block production and publishing.</p></div><Badge variant={productionAllowed ? "success" : "danger"}>{productionAllowed ? "Ready for production" : "Blocked · rights unresolved"}</Badge></div><p className="mt-3 text-xs text-muted">No real scene-to-asset persistence is configured in this mock UI. Database migration also adds server-side rights guards.</p></section>
    <footer className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-muted"><p>Upload security strategy: private quarantine bucket → file signature validation → malware scan → rights review → clean private storage. This demo implements signed URL issuance and client validation only when Supabase auth/storage is configured; it does not claim malware scanning is active.</p><p className="mt-2">Current asset count: {assets.length} · upload max {Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB · allowed types: {acceptedUploadTypes.map((type) => type.split("/")[1]).join(", ")}</p></footer>
  </main>;
}
