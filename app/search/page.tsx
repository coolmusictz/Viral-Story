import { Suspense } from "react";
import { SearchExperience } from "@/components/search-experience";

export default function SearchPage() {
  return <Suspense fallback={<main className="min-h-screen p-8 text-muted">Loading search…</main>}><SearchExperience/></Suspense>;
}
