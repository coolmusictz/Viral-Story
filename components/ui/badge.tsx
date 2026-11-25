import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & { variant?: "neutral" | "accent" | "success" | "warning" | "danger"; children: ReactNode };
const variants = { neutral: "border-white/10 bg-white/[0.05] text-muted", accent: "border-ember/20 bg-ember/10 text-ember", success: "border-success/20 bg-success/10 text-success", warning: "border-warning/20 bg-warning/10 text-warning", danger: "border-danger/20 bg-danger/10 text-danger" };

export function Badge({ variant = "neutral", className = "", children, ...props }: Props) {
  return <span className={`inline-flex items-center rounded-pill border px-2.5 py-1 text-[11px] font-medium leading-none ${variants[variant]} ${className}`} {...props}>{children}</span>;
}
