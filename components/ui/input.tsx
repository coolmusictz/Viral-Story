import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; errorMessage?: string };

export function Input({ label, hint, errorMessage, id, className = "", ...props }: Props) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const messageId = `${inputId}-message`;
  return <div className="grid gap-2">
    <label className="text-sm font-medium text-paper" htmlFor={inputId}>{label}{props.required && <span aria-hidden="true" className="ml-1 text-ember">*</span>}</label>
    <input id={inputId} aria-invalid={errorMessage ? true : undefined} aria-describedby={hint || errorMessage ? messageId : undefined} className={`min-h-11 w-full rounded-md border bg-[#151514] px-3.5 text-sm text-paper placeholder:text-subtle transition-colors focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25 disabled:cursor-not-allowed disabled:opacity-50 ${errorMessage ? "border-danger" : "border-white/10"} ${className}`} {...props} />
    {(hint || errorMessage) && <p id={messageId} className={`text-xs leading-5 ${errorMessage ? "text-danger" : "text-muted"}`}>{errorMessage ?? hint}</p>}
  </div>;
}
