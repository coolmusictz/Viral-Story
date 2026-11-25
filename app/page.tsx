import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-10">
      <header className="flex items-center justify-between border-b border-white/10 pb-5">
        <p className="text-sm font-bold tracking-[0.18em] text-paper">
          VIRALSTORY <span className="text-ember">AI</span>
        </p>
        <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-muted">
          EN · SW
        </span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-16 sm:py-24">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-ember">
          Stories for the scroll
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-paper sm:text-7xl">
          Big stories.
          <br />
          <span className="text-muted">Short moments.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
          Kiswahili na Kiingereza. A new home for short stories worth sharing.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <span className="rounded-full bg-ember px-5 py-3 text-sm font-semibold text-ink">
            Coming soon
          </span>
          <Link
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-paper transition-colors hover:border-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
            href="/health"
          >
            Check app status
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 pt-5 text-xs text-muted">
        Stories in English and Kiswahili.
      </footer>
    </main>
  );
}
