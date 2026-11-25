import type { ReactNode } from "react";

type Props = { title: string; description: string; action?: ReactNode };

export function ErrorState({ title, description, action }: Props) {
  return <section role="alert" className="rounded-lg border border-danger/20 bg-danger/[0.06] p-5 sm:p-6">
    <p className="text-xs font-semibold uppercase tracking-widest text-danger">Something went wrong</p>
    <h2 className="mt-2 text-base font-semibold text-paper">{title}</h2>
    <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </section>;
}
