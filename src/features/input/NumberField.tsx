import { useEffect, useId, useState } from 'react';
import { HelpTooltip } from './HelpTooltip';
import { formatYen } from '../../lib/format';

// 数値入力。フォーカス中は素の数字を編集（カーソル体験を壊さない）、
// 非フォーカス時はカンマ区切りで表示する。inputMode="numeric"。
export function NumberField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  help,
  helpLabel,
  placeholder,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  min?: number;
  max?: number;
  help?: string;
  helpLabel?: string;
  placeholder?: string;
}) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  // 非フォーカス時は外部 value を反映。フォーカス中はユーザー入力を尊重。
  useEffect(() => {
    if (!focused) {
      setDraft(value === null || Number.isNaN(value) ? '' : String(value));
    }
  }, [value, focused]);

  const display = focused
    ? draft
    : value === null || Number.isNaN(value)
      ? ''
      : formatYen(value);

  function commit(raw: string) {
    const digits = raw.replace(/[^\d]/g, '');
    if (digits === '') {
      onChange(null);
      return;
    }
    let n = Number(digits);
    if (typeof min === 'number' && n < min) n = min;
    if (typeof max === 'number' && n > max) n = max;
    onChange(n);
  }

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {help && (
          <>
            {' '}
            <HelpTooltip text={help} label={helpLabel ?? `${label}の説明`} />
          </>
        )}
      </label>
      <div className="field__row">
        <input
          id={id}
          className="field__input"
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={display}
          aria-describedby={unit ? `${id}-unit` : undefined}
          onFocus={() => {
            setFocused(true);
            setDraft(value === null || Number.isNaN(value) ? '' : String(value));
          }}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            commit(next);
          }}
          onBlur={() => {
            setFocused(false);
            commit(draft);
          }}
        />
        {unit && (
          <span className="field__unit" id={`${id}-unit`}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
