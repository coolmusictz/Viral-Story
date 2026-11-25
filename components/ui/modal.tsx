"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode };

export function Modal({ open, title, description, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return <dialog ref={dialogRef} aria-labelledby="modal-title" aria-describedby={description ? "modal-description" : undefined} onClose={onClose} onClick={(event) => { if (event.target === dialogRef.current) onClose(); }} className="w-[calc(100%-2rem)] max-w-lg rounded-lg border border-white/10 bg-[#1a1918] p-0 text-paper shadow-popover backdrop:bg-black/70 backdrop:backdrop-blur-sm">
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><h2 id="modal-title" className="text-lg font-semibold">{title}</h2>{description && <p id="modal-description" className="mt-2 text-sm leading-6 text-muted">{description}</p>}</div><button autoFocus aria-label="Close dialog" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-muted hover:bg-white/[0.06] hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-ember">×</button></div>
      <div className="mt-6">{children}</div>
    </div>
  </dialog>;
}
