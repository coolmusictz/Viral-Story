import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { children: ReactNode; padding?: "sm" | "md" | "lg" };
const padding = { sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" };

export function Card({ className = "", padding: cardPadding = "md", children, ...props }: Props) {
  return <div className={`rounded-lg border border-white/[0.08] bg-surface shadow-card ${padding[cardPadding]} ${className}`} {...props}>{children}</div>;
}
