import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { Badge } from "@/components/ui/badge";
import { StoryCard } from "@/components/story-card";
import { getPublishedStoryBySlug, listPublishedStories } from "@/lib/repositories/story-repository";
import { formatDuration } from "@/components/story-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublishedStoryBySlug(slug);
  if (!story) return { title: "Story not found" };
  return { title: story.title.en, description: story.synopsis.en, alternates: { canonical: `/story/${story.slug}` } };
}

export default async function StoryDetailPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const story = await getPublishedStoryBySlug(slug);
  if (!story) notFound();
  const language = query.lang === "sw" ? "sw" : "en";
  const related = (await listPublishedStories({ category: story.category.slug })).filter((item) => item.slug !== slug).slice(0, 3);
  return <><PublicHeader language={language}/><main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12"><a className="text-sm text-muted hover:text-paper" href="/reels">← {language === "sw" ? "Rudi kwenye video" : "Back to reels"}</a><article className="mt-6 grid gap-8 md:grid-cols-[minmax(260px,0.8fr)_1.2fr]"><div className={`relative mx-auto aspect-[9/14] w-full max-w-[350px] overflow-hidden rounded-lg bg-gradient-to-br ${story.poster.gradient}`}><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_30%,rgba(255,106,42,.25),transparent_42%)]"/><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-20"><Badge variant="neutral">{story.category.label[language]}</Badge><h1 className="mt-3 text-2xl font-semibold leading-tight text-white">{story.title[language]}</h1></div><span className="absolute right-3 top-3 rounded-pill bg-black/40 px-3 py-1 text-xs text-white">{formatDuration(story.durationSeconds)}</span></div><div className="py-2"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">{language === "sw" ? "Hadithi fupi" : "Short story"}</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{story.title[language]}</h1><div className="mt-4 flex flex-wrap gap-2"><Badge variant="accent">{story.language === "sw" ? "Kiswahili" : "English"}</Badge><Badge>{story.category.label[language]}</Badge><Badge>{story.views.toLocaleString()} {language === "sw" ? "kutazamwa" : "views"}</Badge></div><p className="mt-6 text-base leading-7 text-muted">{story.synopsis[language]}</p><section className="mt-8 rounded-lg border border-white/10 bg-surface p-5"><h2 className="text-sm font-semibold">{language === "sw" ? "Manukuu ya hadithi" : "Story captions"}</h2><p className="mt-3 text-sm leading-7 text-muted">{story.caption[language]}</p></section><p className="mt-5 text-xs text-muted">{language === "sw" ? "Picha ni kielelezo cha mfano; video halisi haijaunganishwa." : "Poster is a mock illustration; licensed video is not connected yet."}</p></div></article>{related.length > 0 && <section className="mt-12 border-t border-white/10 pt-8"><h2 className="mb-5 text-xl font-semibold">{language === "sw" ? "Hadithi nyingine" : "More stories"}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <StoryCard key={item.id} story={item} language={language}/>)}</div></section>}</main><PublicFooter language={language}/></>;
}
