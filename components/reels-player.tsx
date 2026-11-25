"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Story } from "@/types/story";
import { formatDuration } from "@/components/story-card";

export function ReelsPlayer({ stories, language = "en" }: { stories: Story[]; language?: "en" | "sw" }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [captions, setCaptions] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaError, setMediaError] = useState(false);
  const [sharing, setSharing] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const story = stories[index];
  const localized = language === "sw";

  const stop = useCallback(() => {
    setPlaying(false);
    videoRef.current?.pause();
  }, []);
  const move = useCallback((direction: number) => {
    stop();
    setProgress(0);
    setMediaError(false);
    setIndex((current) => (current + direction + stories.length) % stories.length);
  }, [stop, stories.length]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        setMuted(true);
        if (story.videoUrl && videoRef.current) {
          videoRef.current.muted = true;
          void videoRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          setPlaying(true);
        }
      } else {
        setPlaying(false);
        videoRef.current?.pause();
      }
    }, { threshold: [0, 0.6, 1] });
    observer.observe(node);
    return () => observer.disconnect();
  }, [index, story.videoUrl]);

  useEffect(() => {
    if (!playing || story.videoUrl) return;
    const timer = window.setInterval(() => setProgress((value) => {
      if (value >= story.durationSeconds) { setPlaying(false); return story.durationSeconds; }
      return value + 0.25;
    }), 250);
    return () => window.clearInterval(timer);
  }, [playing, story.durationSeconds, story.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !story.videoUrl) return;
    const update = () => setProgress(video.currentTime);
    video.addEventListener("timeupdate", update);
    return () => video.removeEventListener("timeupdate", update);
  }, [story.videoUrl, index]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowDown") { event.preventDefault(); move(1); }
      if (event.key === "ArrowUp") { event.preventDefault(); move(-1); }
      if (event.key === " ") { event.preventDefault(); togglePlay(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!story) return <div className="grid min-h-[50vh] place-items-center text-muted">{localized ? "Hakuna hadithi zilizochapishwa bado." : "No published stories yet."}</div>;

  function togglePlay() {
    const video = videoRef.current;
    if (story.videoUrl && video) {
      if (video.paused) { video.muted = muted; void video.play().then(() => setPlaying(true)).catch(() => setMediaError(true)); }
      else { video.pause(); setPlaying(false); }
    } else {
      if (progress >= story.durationSeconds) setProgress(0);
      setPlaying((value) => !value);
    }
  }

  async function share() {
    const url = `${window.location.origin}/story/${story.slug}`;
    try {
      if (navigator.share) await navigator.share({ title: story.title[language], url });
      else { await navigator.clipboard.writeText(url); setSharing(true); window.setTimeout(() => setSharing(false), 1800); }
    } catch { setSharing(false); }
  }

  return <section ref={containerRef} aria-label={localized ? "Video za hadithi" : "Story reels"} className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-5xl items-center justify-center gap-3 py-4 sm:gap-5">
    <button aria-label={localized ? "Hadithi iliyotangulia" : "Previous story"} onClick={() => move(-1)} className="hidden h-12 w-12 shrink-0 rounded-pill border border-white/10 text-paper hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember sm:grid sm:place-items-center">↑</button>
    <div className="relative aspect-[9/16] max-h-[calc(100svh-9rem)] w-full max-w-[410px] overflow-hidden rounded-lg border border-white/10 bg-[#181716] shadow-card">
      <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${story.poster.gradient}`} />
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,106,42,.22),transparent_42%)]" />
      {story.videoUrl && !mediaError && <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" src={story.videoUrl} playsInline muted={muted} loop onError={() => { setMediaError(true); setPlaying(false); }} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} aria-label={story.title[language]} />}
      {(!story.videoUrl || mediaError) && <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center" aria-label="Generated mock poster placeholder"><span className="mb-5 grid h-16 w-16 place-items-center rounded-pill border border-white/20 bg-black/20 text-2xl text-white/80" aria-hidden="true">▶</span><p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">{mediaError ? (localized ? "Video haipatikani" : "Video unavailable") : (localized ? "Onyesho la mfano" : "Mock preview")}</p><p className="mt-3 text-sm text-white/60">{story.poster.motif}</p></div>}
      <button onClick={togglePlay} aria-label={playing ? (localized ? "Sitisha video" : "Pause video") : (localized ? "Cheza video" : "Play video")} className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-ember"><span className="sr-only">{playing ? "Pause" : "Play"}</span></button>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4"><span className="rounded-pill border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-medium text-white">{story.language === "sw" ? "KISWAHILI" : "ENGLISH"}</span><span className="rounded-pill border border-white/20 bg-black/35 px-3 py-1.5 text-xs text-white">{story.category.label[language]}</span></div>
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
        {captions && <p className="mb-4 rounded-md bg-black/65 p-3 text-center text-sm leading-6 text-white" aria-live="polite">{story.caption[language]}</p>}
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">{localized ? "Hadithi fupi" : "Short story"} · {formatDuration(story.durationSeconds)}</p>
        <Link className="relative z-30 mt-1 inline-block max-w-[85%] text-xl font-semibold leading-tight text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" href={`/story/${story.slug}?lang=${language}`}>{story.title[language]}</Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="relative z-30 grid h-10 w-10 place-items-center rounded-pill bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▶"}</button>
            <button onClick={() => { const next = !muted; setMuted(next); if (videoRef.current) videoRef.current.muted = next; }} className="relative z-30 grid h-10 w-10 place-items-center rounded-pill bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" aria-label={muted ? "Unmute" : "Mute"}>{muted ? "◖×" : "◖"}</button>
            <button onClick={() => setCaptions((value) => !value)} aria-pressed={captions} className="relative z-30 rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" aria-label={localized ? "Badili manukuu" : "Toggle captions"}>CC</button>
            <button onClick={() => void share()} className="relative z-30 grid h-10 w-10 place-items-center rounded-pill bg-white/10 text-white hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" aria-label={localized ? "Shiriki hadithi" : "Share story"}>{sharing ? "✓" : "↗"}</button>
          </div>
          <span className="text-xs tabular-nums text-white/70">{formatDuration(Math.floor(progress))} / {formatDuration(story.durationSeconds)}</span>
        </div>
        <label className="mt-3 block"><span className="sr-only">Seek video progress</span><input type="range" min={0} max={story.durationSeconds} step={0.1} value={progress} onChange={(event) => { const value = Number(event.target.value); setProgress(value); if (videoRef.current) videoRef.current.currentTime = value; }} className="h-1 w-full cursor-pointer accent-ember" aria-label="Video progress" /></label>
        {!story.videoUrl && <p className="mt-2 text-[10px] text-white/50">{localized ? "Video kamili itaonekana baada ya media kuunganishwa." : "Licensed video asset not connected — mock preview only."}</p>}
      </div>
    </div>
    <button aria-label={localized ? "Hadithi inayofuata" : "Next story"} onClick={() => move(1)} className="hidden h-12 w-12 shrink-0 rounded-pill border border-white/10 text-paper hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember sm:grid sm:place-items-center">↓</button>
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center gap-4 border-t border-white/10 bg-background/95 p-2 backdrop-blur sm:hidden"><button className="min-h-11 rounded-md px-5 text-sm text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" onClick={() => move(-1)}>{localized ? "↑ Iliyotangulia" : "↑ Previous"}</button><button className="min-h-11 rounded-md px-5 text-sm text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" onClick={() => move(1)}>{localized ? "↓ Inayofuata" : "↓ Next"}</button></div>
  </section>;
}
