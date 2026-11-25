import Link from "next/link";
import { Brand } from "@/components/brand";

const navigation = [
  { href: "/admin", label: "Overview", icon: "◫" },
  { href: "/admin?view=stories", label: "Stories", icon: "▤" },
  { href: "/admin?view=studio", label: "Story studio", icon: "✳" },
  { href: "/admin?view=review", label: "Review queue", icon: "◷" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-[#151514] lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[248px] lg:flex-col lg:border-b-0 lg:border-r">
        <div className="hidden h-[72px] items-center border-b border-white/10 px-6 lg:flex"><Brand /></div>
        <div className="flex items-center justify-between gap-4 px-5 py-4 lg:hidden"><Brand /><span className="text-[10px] uppercase tracking-widest text-warning">Preview · no auth</span></div>
        <nav aria-label="Admin navigation" className="flex gap-2 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:py-6">
          {navigation.map((item, index) => (
            <Link key={item.label} aria-current={index === 0 ? "page" : undefined} className={`flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember ${index === 0 ? "bg-white/[0.08] text-paper" : "text-muted hover:bg-white/[0.05] hover:text-paper"}`} href={item.href}>
              <span aria-hidden="true" className="w-5 text-center text-base">{item.icon}</span>{item.label}
              {item.label === "Review queue" && <span className="ml-auto rounded-pill bg-ember/15 px-2 py-0.5 text-[10px] text-ember">3</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-white/10 p-4 text-xs leading-5 text-muted lg:block">Studio preview only.<br /><span className="text-warning">Authentication is not connected.</span></div>
      </aside>
      <div className="min-w-0 lg:col-start-2 lg:pl-0">
        <header className="flex min-h-[72px] items-center justify-between gap-4 border-b border-white/10 px-5 sm:px-8">
          <div><p className="text-sm font-semibold text-paper">Creator studio</p><p className="text-xs text-muted">Draft, review and publish stories</p></div>
          <div className="flex items-center gap-3"><span className="hidden rounded-pill border border-warning/25 bg-warning/10 px-3 py-1.5 text-xs text-warning sm:inline-flex">Preview · no auth</span><span aria-label="Studio user" className="grid h-9 w-9 place-items-center rounded-pill bg-raised text-xs font-semibold text-paper">VS</span></div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
