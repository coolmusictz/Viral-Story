import Link from "next/link";
import type { Story } from "@/types/story";
import { Badge } from "@/components/ui/badge";

type Props = { story: Story; language: "en" | "sw" };
export function StoryCard({ story, language }: Props) {
  return <Link href={`/story/${story.slug}?lang=${language}`} className="group block rounded-lg border border-white/[0.08] bg-surface p-3 transition-colors hover:border-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">
    <div className={`relative aspect-[9/11] overflow-hidden rounded-md bg-gradient-to-br ${story.poster.gradient}`}><div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_30%,rgba(255,255,255,.13),transparent_44%)]" /><span className="absolute left-3 top-3"><Badge variant="neutral">{story.category.label[language].toLocaleUpperCase(language === "sw" ? "sw-TZ" : "en-US")}</Badge></span><span className="absolute bottom-3 right-3 rounded bg-black/55 px-2 py-1 text-xs text-white">{formatDuration(story.durationSeconds)}</span><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12"><h3 className="text-lg font-semibold leading-tight text-white">{story.title[language]}</h3><p className="mt-1 text-xs text-white/70">{story.language === "sw" ? "Kiswahili" : "English"}</p></div></div>
    <p className="px-1 pb-1 pt-3 text-sm leading-6 text-muted">{story.synopsis[language]}</p>
  </Link>;
}

export function formatDuration(seconds: number) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
