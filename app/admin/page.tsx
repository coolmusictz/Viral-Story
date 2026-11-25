import Link from "next/link";
import { AdminStudio } from "@/components/admin-studio";
import { Suspense } from "react";

export default function AdminPage() {
  return <Suspense fallback={<main className="p-8 text-sm text-muted">Loading studio…</main>}>
    <div className="flex justify-end border-b border-white/10 bg-background px-5 py-3 sm:px-8">
      <Link href="/admin/media" className="rounded-md border border-white/10 px-3 py-2 text-xs text-paper hover:border-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">Open media workflow →</Link>
    </div>
    <AdminStudio />
  </Suspense>;
}
