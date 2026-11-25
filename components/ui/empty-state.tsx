import type { ReactNode } from "react";

type Props = { title: string; description: string; action?: ReactNode; icon?: ReactNode };

export function EmptyState({ title, description, action, icon }: Props) {
  return <section className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 px-5 py-10 text-center" aria-labelledby="empty-state-title">
    <span aria-hidden="true" className="mb-4 grid h-11 w-11 place-items-center rounded-pill bg-white/[0.05] text-xl text-muted">{icon ?? "✳"}</span>
    <h2 id="empty-state-title" className="text-base font-semibold text-paper">{title}</h2>
    <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </section>;
}
