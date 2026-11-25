import { notFound } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { StoryCard } from "@/components/story-card";
import { listPublishedStories } from "@/lib/repositories/story-repository";

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string; language?: string }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const language = query.lang === "sw" ? "sw" : "en";
  const all = await listPublishedStories({ category: slug });
  if (!all.length) notFound();
  const stories = await listPublishedStories({ category: slug, language: query.language === "en" || query.language === "sw" ? query.language : "all" });
  const label = all[0]!.category.label[language];
  return <><PublicHeader language={language}/><main className="mx-auto min-h-[70vh] w-full max-w-7xl px-5 py-10 sm:px-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">{language === "sw" ? "Kundi" : "Category"}</p><h1 className="mt-2 text-4xl font-semibold">{label}</h1><p className="mt-3 text-sm text-muted">{all.length} {language === "sw" ? "hadithi zilizochapishwa" : "published stories"}</p><form action={`/category/${slug}`} className="mt-6 flex flex-wrap items-center gap-3"><input type="hidden" name="lang" value={language}/><label htmlFor="category-language" className="text-sm text-muted">{language === "sw" ? "Chuja lugha" : "Filter language"}</label><select id="category-language" name="language" defaultValue={query.language ?? "all"} className="min-h-10 rounded-md border border-white/10 bg-surface px-3 text-sm"><option value="all">All</option><option value="en">English</option><option value="sw">Kiswahili</option></select><button className="min-h-10 rounded-md bg-ember px-4 text-sm font-semibold text-background">{language === "sw" ? "Chuja" : "Filter"}</button></form>{stories.length ? <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stories.map((story) => <StoryCard key={story.id} story={story} language={language}/>)}</div> : <p className="mt-8 rounded-lg border border-dashed border-white/15 p-10 text-center text-muted">No published stories in this language yet.</p>}</main><PublicFooter language={language}/></>;
}
