"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicFooter, PublicHeader } from "@/components/public-shell";
import { StoryCard } from "@/components/story-card";
import { listPublishedStories } from "@/lib/repositories/story-repository";
import type { Story } from "@/types/story";

export function SearchExperience() {
  const params = useSearchParams();
  const language = params.get("lang") === "sw" ? "sw" : "en";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true); setError(false);
      void listPublishedStories({ query }).then(setStories).catch(() => setError(true)).finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return <><PublicHeader language={language}/><main className="mx-auto min-h-[70vh] w-full max-w-7xl px-5 py-10 sm:px-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">{language === "sw" ? "Gundua" : "Discover"}</p><h1 className="mt-2 text-4xl font-semibold">{language === "sw" ? "Tafuta hadithi" : "Search stories"}</h1><label htmlFor="story-search" className="sr-only">{language === "sw" ? "Tafuta hadithi" : "Search by title, story or category"}</label><input id="story-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "sw" ? "Tafuta kichwa, hadithi au kundi…" : "Search title, story or category…"} className="mt-6 min-h-12 w-full max-w-2xl rounded-md border border-white/10 bg-surface px-4 text-sm text-paper placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" aria-describedby="search-status"/>
    <p id="search-status" className="mt-3 min-h-5 text-sm text-muted" aria-live="polite">{loading ? (language === "sw" ? "Inatafuta…" : "Searching…") : error ? "Search is temporarily unavailable." : `${stories.length} ${language === "sw" ? "matokeo" : "results"}`}</p>
    {error ? <div role="alert" className="rounded-lg border border-danger/20 p-5 text-sm text-danger">Could not search mock stories. Please try again.</div> : stories.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stories.map((story) => <StoryCard key={story.id} story={story} language={language}/>)}</div> : !loading && <div className="mt-4 rounded-lg border border-dashed border-white/15 px-6 py-12 text-center"><h2 className="font-semibold">{language === "sw" ? "Hakuna hadithi zilizopatikana" : "No stories found"}</h2><p className="mt-2 text-sm text-muted">{language === "sw" ? "Jaribu maneno mengine ya kutafuta." : "Try another title, category or keyword."}</p></div>}</main><PublicFooter language={language}/></>;
}
