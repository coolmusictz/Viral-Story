import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const mockStories = [
  { title: "The last matatu to Kariakoo", language: "Kiswahili", stage: "Needs review", tone: "warning" as const },
  { title: "A voice note from tomorrow", language: "English", stage: "Script draft", tone: "accent" as const },
  { title: "Mwezi juu ya bahari", language: "Kiswahili", stage: "Storyboard", tone: "neutral" as const },
];

export default function AdminPage() {
  return <AdminShell>
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">Wednesday, November 25</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-paper">Studio overview</h1><p className="mt-2 text-sm text-muted">A snapshot of your story pipeline.</p></div>
      <Badge variant="warning">Mock data · no database</Badge>
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      {[{ label: "Stories in progress", value: "08", note: "Across both languages" }, { label: "Awaiting your review", value: "03", note: "Nothing publishes without approval" }, { label: "Published this week", value: "12", note: "Demo figures only" }].map((stat) => <Card key={stat.label} padding="md"><p className="text-sm text-muted">{stat.label}</p><p className="mt-4 text-4xl font-semibold tracking-tight text-paper">{stat.value}</p><p className="mt-2 text-xs text-muted">{stat.note}</p></Card>)}
    </div>
    <section className="mt-8"><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-paper">Recent stories</h2><span className="text-xs text-muted">Mock examples</span></div><div className="overflow-hidden rounded-lg border border-white/[0.08] bg-surface">{mockStories.map((story, index) => <div key={story.title} className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${index ? "border-t border-white/[0.08]" : ""}`}><div><h3 className="text-sm font-medium text-paper">{story.title}</h3><p className="mt-1 text-xs text-muted">{story.language} · Updated today</p></div><Badge variant={story.tone}>{story.stage}</Badge></div>)}</div></section>
    <p className="mt-5 text-xs leading-5 text-muted">Preview only. This admin shell is not authenticated and must not be used for real publishing.</p>
  </AdminShell>;
}
