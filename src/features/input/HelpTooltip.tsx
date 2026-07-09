import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

// ？ヘルプ。タップで開き、外側タップ / Escape で閉じる。
// Escape で閉じたらトリガーへフォーカスを戻す。

/** bubble を画面内へ収めるための X 方向シフト量（px）。
 *  右端が viewport を超えた分だけ左へ寄せ、左端が margin を割る場合は右へ戻す（左端保護を優先）。
 *  収まっている場合は 0。純関数（テスト対象）。モバイル375px契約。 */
export function bubbleShiftX(
  left: number,
  right: number,
  viewportWidth: number,
  margin = 12,
): number {
  let dx = 0;
  if (right > viewportWidth - margin) dx = viewportWidth - margin - right;
  if (left + dx < margin) dx = margin - left;
  return dx;
}

export function HelpTooltip({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const bubbleId = useId();
  const bubbleRef = useRef<HTMLSpanElement>(null);

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
  // 開いている間、実測位置から画面内へクランプする。resize / 画面回転でも再計算し、
  // 閉じたら transform をリセットする（次回オープン時の実測を汚さない）。
  useLayoutEffect(() => {
    if (!open) return;
    const el = bubbleRef.current;
    if (!el) return;
    const apply = () => {
      el.style.transform = ''; // 素の位置で実測してからシフト量を決める
      const rect = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth || window.innerWidth;
      const dx = bubbleShiftX(rect.left, rect.right, vw);
      if (dx !== 0) el.style.transform = `translateX(${dx}px)`;
    };
    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);
    return () => {
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
      el.style.transform = '';
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
        <span className="help__bubble" id={bubbleId} role="note" ref={bubbleRef}>
          {text}
        </span>
      )}
    </span>
  );
}
