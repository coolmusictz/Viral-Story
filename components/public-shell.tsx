import Link from "next/link";
import { Brand } from "@/components/brand";

const links = [
  { href: "/#stories", label: "Stories" },
  { href: "/health", label: "About" },
];

export function PublicHeader() {
  return (
    <header className="border-b border-white/[0.08]">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <Brand />
        <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-8">
          {links.map((link) => (
            <Link key={link.href} className="rounded-sm text-sm text-muted transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" href={link.href}>
              {link.label}
            </Link>
          ))}
          <span className="rounded-pill border border-white/10 px-3 py-1.5 text-xs font-medium text-muted" aria-label="Available languages: English and Kiswahili">EN <span aria-hidden="true">·</span> SW</span>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.08]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Brand compact />
        <p>Stories in English and Kiswahili. Made for the moment.</p>
        <Link className="w-fit rounded-sm hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" href="/health">About this project</Link>
      </div>
    </footer>
  );
}
