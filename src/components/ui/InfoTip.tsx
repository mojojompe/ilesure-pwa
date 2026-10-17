import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { InformationCircleIcon } from '@hugeicons/react';

/**
 * A small (i) button that opens a short explanation under it. Tap to open (no hover, so
 * it works the same on phones); tap outside, scroll or press Escape to close.
 *
 * Same behaviour as the web app's InfoTip. The panel is portalled to <body> because this
 * one is also used inside modals, where a transformed or scrolling ancestor would
 * otherwise misplace or clip a `fixed` panel. It is placed against the viewport and
 * clamped to it, so an icon near the right edge still opens a fully visible panel.
 */
const PANEL_WIDTH = 288;
const GUTTER = 12;

export function InfoTip({ title, body }: { title: string; body: string }) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const open = pos !== null;
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLSpanElement>(null);
  const id = useId();

  const close = () => setPos(null);
  const toggle = (e: React.MouseEvent) => {
    // Often sits inside a tappable row (timeline steps); don't trigger the row.
    e.stopPropagation();
    if (open || !button.current) return close();
    const r = button.current.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - GUTTER * 2);
    const left = Math.min(Math.max(r.left, GUTTER), window.innerWidth - width - GUTTER);
    setPos({ top: r.bottom + 6, left, width });
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (button.current?.contains(t) || panel.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-label={`About: ${title}`}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className="ml-1 inline-flex shrink-0 items-center justify-center rounded-full align-middle text-textTertiary active:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <InformationCircleIcon size={16} />
      </button>
      {pos && createPortal(
        <span
          ref={panel}
          id={id}
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
          style={{ top: pos.top, left: pos.left, width: pos.width }}
          className="fixed z-[70] rounded-clay-sm border border-border bg-surface p-3 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-textSecondary shadow-clay"
        >
          <span className="mb-1 block font-semibold text-textPrimary">{title}</span>
          {body}
        </span>,
        document.body,
      )}
    </>
  );
}
