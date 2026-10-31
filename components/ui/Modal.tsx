"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  /** Shown when the dialog is dismissed with Escape or the backdrop. */
  onClose?: () => void;
  wide?: boolean;
}

export function Modal({ title, children, onClose, wide }: ModalProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("button, input")?.focus();
    return () => previous?.focus?.();
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div ref={ref} className={`panel modal${wide ? " modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId} className="panel-title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
