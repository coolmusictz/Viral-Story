import { StatusIndicator } from "@/components/status-indicator";
import { getHealthStatus } from "@/lib/health";

export const metadata = {
  title: "Health",
};

export default function HealthPage() {
  const health = getHealthStatus();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-12 sm:px-8">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-ember">
        System check
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-paper sm:text-5xl">
        App health
      </h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-muted">
        A lightweight scaffold check. This does not yet verify database or
        external provider connectivity.
      </p>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <StatusIndicator status={health.status} />
        <dl className="mt-6 grid gap-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Service</dt>
            <dd className="mt-1 font-medium text-paper">{health.service}</dd>
          </div>
          <div>
            <dt className="text-muted">Check</dt>
            <dd className="mt-1 font-medium text-paper">Local app response</dd>
          </div>
        </dl>
      </div>
      <a
        className="mt-8 w-fit rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-paper hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
        href="/"
      >
        Back to home
      </a>
    </main>
  );
}
