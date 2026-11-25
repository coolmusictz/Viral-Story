"use client";

import { useEffect } from "react";

type Props = { message: string; onDismiss: () => void; duration?: number; label?: string };

export function Toast({ message, onDismiss, duration = 4000, label = "Notification" }: Props) {
  useEffect(() => {
    if (duration <= 0) return;
    const timeout = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timeout);
  }, [duration, message, onDismiss]);

  return <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-md border border-white/10 bg-[#242321] px-4 py-3.5 text-sm text-paper shadow-popover sm:inset-x-auto sm:right-6" role="status" aria-live="polite" aria-label={label}>
    <span>{message}</span>
    <button aria-label="Dismiss notification" onClick={onDismiss} className="grid h-8 w-8 shrink-0 place-items-center rounded-sm text-muted hover:bg-white/[0.07] hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">×</button>
  </div>;
}
