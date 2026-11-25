import { Suspense } from "react";
import { AdminStudio } from "@/components/admin-studio";

export default function AdminPage() {
  return <Suspense fallback={<main className="p-8 text-sm text-muted">Loading studio…</main>}><AdminStudio /></Suspense>;
}
