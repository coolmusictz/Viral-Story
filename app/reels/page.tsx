import { ReelsPlayer } from "@/components/reels-player";
import { PublicHeader } from "@/components/public-shell";
import { listPublishedStories } from "@/lib/repositories/story-repository";

export default async function ReelsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const language = lang === "sw" ? "sw" : "en";
  const stories = await listPublishedStories({ sort: "popular" });
  return <><PublicHeader language={language}/><main className="px-3 sm:px-6"><div className="mx-auto flex max-w-5xl items-center justify-between pt-4"><div><h1 className="text-xl font-semibold">{language === "sw" ? "Hadithi za video" : "Story reels"}</h1><p className="mt-1 text-xs text-muted">{language === "sw" ? "Video fupi za hadithi" : "Short-form story videos"}</p></div><span className="text-xs text-muted">{stories.length} {language === "sw" ? "hadithi" : "stories"}</span></div><ReelsPlayer stories={stories} language={language}/></main></>;
}
