import { requireAdmin } from "@/server/supabase/server";
import { Card } from "@/components/ui/card";

type AnalyticsReport = {
  totals?: { impressions?: number; starts?: number; watchMs?: number; completions?: number; shares?: number; likes?: number };
  topVideos?: Array<{ id: string; title_en: string; views: number; watch_ms: number; completions: number }>;
};

export default async function AnalyticsPage() {
  let report: AnalyticsReport | null = null;
  let unavailable = false;

  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase.rpc("admin_video_analytics");
    if (error) unavailable = true;
    else report = data as AnalyticsReport;
  } catch {
    unavailable = true;
  }

  if (unavailable) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">Aggregate insights</p>
        <h1 className="mt-2 text-3xl font-semibold">Analytics</h1>
        <p role="status" className="mt-5 rounded-lg border border-warning/20 bg-warning/[0.05] p-5 text-sm leading-6 text-muted">
          Analytics are unavailable until the database migration and an authorized admin session are configured. Demo figures are intentionally not presented as live metrics.
        </p>
      </main>
    );
  }

  const totals = report?.totals ?? {};
  const topVideos = report?.topVideos ?? [];
  const cards: Array<[string, string | number]> = [
    ["Impressions", totals.impressions ?? 0],
    ["Video starts", totals.starts ?? 0],
    ["Watch time", `${Math.round((totals.watchMs ?? 0) / 60000)} min`],
    ["Completion rate", totals.starts ? `${Math.round(((totals.completions ?? 0) / totals.starts) * 1000) / 10}%` : "0%"],
    ["Shares", totals.shares ?? 0],
    ["Likes", totals.likes ?? 0],
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-10 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">Privacy-first aggregate reporting</p>
      <h1 className="mt-2 text-3xl font-semibold">Analytics</h1>
      <p className="mt-2 text-sm text-muted">Aggregated events only. No user-level tracking or personalized profiles.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Top stories</h2>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase text-muted">
              <tr><th className="px-4 py-3">Story</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Avg watch</th><th className="px-4 py-3">Completions</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {topVideos.map((video) => (
                <tr key={video.id}>
                  <th scope="row" className="px-4 py-3 font-medium">{video.title_en}</th>
                  <td className="px-4 py-3">{video.views}</td>
                  <td className="px-4 py-3">{video.views ? `${Math.round(video.watch_ms / video.views / 1000)} sec` : "—"}</td>
                  <td className="px-4 py-3">{video.completions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
