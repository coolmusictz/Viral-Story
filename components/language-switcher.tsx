"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function LanguageSwitcher({ language }: { language: "en" | "sw" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  function href(next: "en" | "sw") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", next);
    return `${pathname}?${params.toString()}`;
  }
  return <div aria-label="Language / Lugha" className="flex shrink-0 rounded-pill border border-white/10 p-0.5" role="group">
    <Link aria-label="English" aria-current={language === "en" ? "true" : undefined} className={`rounded-pill px-2 py-1 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember ${language === "en" ? "bg-white/10 text-paper" : "text-muted hover:text-paper"}`} href={href("en")}>EN</Link>
    <Link aria-label="Kiswahili" aria-current={language === "sw" ? "true" : undefined} className={`rounded-pill px-2 py-1 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember ${language === "sw" ? "bg-white/10 text-paper" : "text-muted hover:text-paper"}`} href={href("sw")}>SW</Link>
  </div>;
}
