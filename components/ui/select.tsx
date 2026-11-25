import type { SelectHTMLAttributes } from "react";

type Option = { value: string; label: string };
type Props = SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: Option[]; hint?: string };

export function Select({ label, options, hint, id, className = "", ...props }: Props) {
  const selectId = id ?? props.name ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return <div className="grid gap-2">
    <label className="text-sm font-medium text-paper" htmlFor={selectId}>{label}{props.required && <span aria-hidden="true" className="ml-1 text-ember">*</span>}</label>
    <select id={selectId} aria-describedby={hint ? `${selectId}-hint` : undefined} className={`min-h-11 w-full rounded-md border border-white/10 bg-[#151514] px-3.5 text-sm text-paper focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
    {hint && <p id={`${selectId}-hint`} className="text-xs leading-5 text-muted">{hint}</p>}
  </div>;
}
