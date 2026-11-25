import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { listPublishedCategories, listPublishedStories } from "@/lib/repositories/story-repository";
import { StoryCard } from "@/components/story-card";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const language = lang === "sw" ? "sw" : "en";
  const categories = await listPublishedCategories(language);
  const stories = await listPublishedStories();
  return <><PublicHeader language={language}/><main className="mx-auto min-h-[70vh] w-full max-w-7xl px-5 py-10 sm:px-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">{language === "sw" ? "Chunguza hadithi" : "Explore stories"}</p><h1 className="mt-2 text-4xl font-semibold">{language === "sw" ? "Makundi" : "Categories"}</h1><div className="mt-8 grid gap-5">{categories.map((category) => <section key={category.slug} className="rounded-lg border border-white/[0.08] bg-surface p-4 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-semibold">{category.label}</h2><p className="mt-1 text-xs text-muted">{category.count} {language === "sw" ? "hadithi" : "stories"}</p></div><Link href={`/category/${category.slug}?lang=${language}`} className="text-sm text-ember hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">{language === "sw" ? "Ona zote" : "View all"} →</Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stories.filter((story) => story.category.slug === category.slug).slice(0, 3).map((story) => <StoryCard key={story.id} story={story} language={language}/>)}</div></section>)}</div></main><PublicFooter language={language}/></>;
}
