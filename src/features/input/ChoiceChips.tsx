// 選択チップ群。aria-pressed で選択状態を伝える。

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export function ChoiceChips<T extends string>({
  legend,
  options,
  value,
  onChange,
  disabled,
}: {
  legend: string;
  options: ChoiceOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="field" style={{ border: 0, margin: '8px 0', padding: 0 }}>
      <legend className="field__label">{legend}</legend>
      <div className="choice-group" role="group" aria-label={legend}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className="choice"
            aria-pressed={value === opt.value}
            disabled={disabled || opt.disabled}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
