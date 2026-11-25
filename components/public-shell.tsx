import Link from "next/link";
import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";

export function PublicHeader({ language = "en" }: { language?: "en" | "sw" }) {
  const labels = language === "sw" ? { home: "Nyumbani", reels: "Video", trending: "Zinazovuma", categories: "Makundi", search: "Tafuta" } : { home: "Home", reels: "Reels", trending: "Trending", categories: "Categories", search: "Search" };
  const links = [{ href: "/", label: labels.home }, { href: "/reels", label: labels.reels }, { href: "/trending", label: labels.trending }, { href: "/categories", label: labels.categories }, { href: "/search", label: labels.search }];
  return <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-background/95 backdrop-blur">
    <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
      <Brand />
      <nav aria-label={language === "sw" ? "Urambazaji mkuu" : "Main navigation"} className="flex min-w-0 items-center gap-1 overflow-x-auto sm:gap-3">
        {links.map((link) => <Link key={link.href} className="shrink-0 rounded-sm px-2 py-2 text-xs text-muted transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember sm:px-2.5 sm:text-sm" href={link.href}>{link.label}</Link>)}
      </nav>
      <LanguageSwitcher language={language} />
    </div>
  </header>;
}

export function PublicFooter({ language = "en" }: { language?: "en" | "sw" }) {
  return <footer className="border-t border-white/[0.08]"><div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8"><Brand compact /><p>{language === "sw" ? "Hadithi kwa Kiingereza na Kiswahili." : "Stories in English and Kiswahili. Made for the moment."}</p><Link className="w-fit rounded-sm hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember" href="/health">{language === "sw" ? "Kuhusu" : "About"}</Link></div></footer>;
}
