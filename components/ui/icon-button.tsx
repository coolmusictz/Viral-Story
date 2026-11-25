import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode };

export function IconButton({ label, className = "", children, ...props }: Props) {
  return (
    <button aria-label={label} title={label} className={`inline-grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/[0.03] text-muted transition-colors hover:border-white/25 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
