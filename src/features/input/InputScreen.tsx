import { ja } from '../../strings/ja';
import {
  MAX_CHILDREN,
  PARENT_AGE_MAX,
  PARENT_AGE_MIN,
} from '../../lib/educationAssumptions';
import type { ChildInput } from '../../schema/types';
import type { InputState } from '../../lib/inputDefaults';
import { createDefaultChild } from '../../lib/inputDefaults';
import { NumberField } from './NumberField';
import { ChildCard } from './ChildCard';

const t = ja.input;

export function InputScreen({
  input,
  onChange,
  onSeeResult,
}: {
  input: InputState;
  onChange: (next: InputState) => void;
  onSeeResult: () => void;
}) {
  function updateChild(idx: number, next: ChildInput) {
    const children = input.children.map((c, i) => (i === idx ? next : c));
    onChange({ ...input, children });
  }

  function addChild() {
    if (input.children.length >= MAX_CHILDREN) return;
    onChange({ ...input, children: [...input.children, createDefaultChild()] });
  }

  function removeChild(idx: number) {
    if (input.children.length <= 1) return;
    onChange({
      ...input,
      children: input.children.filter((_, i) => i !== idx),
    });
  }

  const canSeeResult = typeof input.parentAge === 'number';

  return (
    <div className="step-layout">
      <div className="step-content screen">
        <h1 className="app-title">{t.heading}</h1>
        <p className="note">{t.lead}</p>

        <div className="card card--input">
          <NumberField
            label={t.parentAge.label}
            unit={t.parentAge.unit}
            value={input.parentAge}
            min={PARENT_AGE_MIN}
            max={PARENT_AGE_MAX}
            help={t.parentAge.help}
            onChange={(v) => onChange({ ...input, parentAge: v })}
          />
          <NumberField
            label={t.baselineYear.label}
            unit={t.baselineYear.unit}
            value={input.baselineYear}
            min={1900}
            max={3000}
            help={t.baselineYear.help}
            onChange={(v) =>
              onChange({
                ...input,
                baselineYear: v ?? new Date().getFullYear(),
              })
            }
          />
          <p className="note">{t.ageNote}</p>
        </div>

        {input.children.map((child, idx) => (
          <ChildCard
            key={child.id}
            index={idx}
            child={child}
            canRemove={input.children.length > 1}
            onChange={(next) => updateChild(idx, next)}
            onRemove={() => removeChild(idx)}
          />
        ))}

        {input.children.length < MAX_CHILDREN && (
          <button
            type="button"
            className="btn btn--block"
            aria-label={t.child.addLabel}
            onClick={addChild}
          >
            ＋ {t.child.addLabel}
          </button>
        )}
      </div>

      <div className="bottom-nav">
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!canSeeResult}
          onClick={onSeeResult}
        >
          {t.seeResult}
        </button>
      </div>
    </div>
  );
}
