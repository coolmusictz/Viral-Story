import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      aria-label="VIRALSTORY AI home"
      className="inline-flex items-center gap-2 rounded-sm text-sm font-bold tracking-[0.12em] text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember"
      href="/"
    >
      <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-md bg-ember text-sm text-background">
        V
      </span>
      {!compact && <span>VIRALSTORY <span className="text-ember">AI</span></span>}
    </Link>
  );
}
