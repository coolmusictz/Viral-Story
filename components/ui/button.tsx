import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ember text-background hover:bg-[#ff8550] disabled:bg-ember/50",
  secondary: "border border-white/15 bg-white/[0.03] text-paper hover:border-white/30 hover:bg-white/[0.07]",
  ghost: "bg-transparent text-muted hover:bg-white/[0.06] hover:text-paper",
  danger: "bg-danger/15 text-danger hover:bg-danger/25",
};
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

export function Button({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props }: ButtonProps) {
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-pill border-2 border-current border-r-transparent" />}
      {loading ? <><span className="sr-only">Loading</span><span aria-hidden="true">{children}</span></> : children}
    </button>
  );
}
