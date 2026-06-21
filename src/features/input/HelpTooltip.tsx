import { useEffect, useId, useRef, useState } from 'react';

// ？ヘルプ。タップで開き、外側タップ / Escape で閉じる。
// Escape で閉じたらトリガーへフォーカスを戻す。
export function HelpTooltip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleId = useId();

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span className="help" ref={wrapRef}>
      <button
        type="button"
        ref={triggerRef}
        className="help__trigger"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? bubbleId : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        ?
      </button>
      {open && (
        <span className="help__bubble" id={bubbleId} role="note">
          {text}
        </span>
      )}
    </span>
  );
}
