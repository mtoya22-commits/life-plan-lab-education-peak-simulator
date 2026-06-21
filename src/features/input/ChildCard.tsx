import { ja } from '../../strings/ja';
import { CHILD_AGE_MAX, CHILD_AGE_MIN } from '../../lib/educationAssumptions';
import type {
  ChildInput,
  JuniorHighHighSchoolPlan,
  LivingArrangement,
  UniversityPlan,
} from '../../schema/types';
import { NumberField } from './NumberField';
import { ChoiceChips } from './ChoiceChips';

const t = ja.input.child;

export function ChildCard({
  index,
  child,
  canRemove,
  onChange,
  onRemove,
}: {
  index: number; // 0-based
  child: ChildInput;
  canRemove: boolean;
  onChange: (next: ChildInput) => void;
  onRemove: () => void;
}) {
  const n = index + 1;
  const universitySelected = child.universityPlan !== 'none';

  return (
    <fieldset className="child-card">
      <div className="child-card__head">
        <legend className="child-card__legend">{t.legend(n)}</legend>
        {canRemove && (
          <button
            type="button"
            className="btn btn--skip"
            aria-label={t.removeLabel(n)}
            onClick={onRemove}
          >
            削除
          </button>
        )}
      </div>

      <NumberField
        label={t.currentAge.label}
        unit={t.currentAge.unit}
        value={child.currentAge}
        min={CHILD_AGE_MIN}
        max={CHILD_AGE_MAX}
        help={t.currentAge.help}
        onChange={(v) => onChange({ ...child, currentAge: v ?? 0 })}
      />

      <ChoiceChips<JuniorHighHighSchoolPlan>
        legend={t.jhhs.label}
        value={child.juniorHighHighSchoolPlan}
        onChange={(v) => onChange({ ...child, juniorHighHighSchoolPlan: v })}
        options={[
          { value: 'public', label: t.jhhs.options.public },
          { value: 'publicToPrivateHigh', label: t.jhhs.options.publicToPrivateHigh },
          { value: 'privateIntegrated', label: t.jhhs.options.privateIntegrated },
        ]}
      />
      <p className="note">{t.jhhs.descriptions[child.juniorHighHighSchoolPlan]}</p>

      <ChoiceChips<UniversityPlan>
        legend={t.university.label}
        value={child.universityPlan}
        onChange={(v) =>
          onChange({
            ...child,
            universityPlan: v,
            // 大学進学なしにしたら通学形態は自宅に戻す（無効化対応）。
            livingArrangement: v === 'none' ? 'home' : child.livingArrangement,
          })
        }
        options={[
          { value: 'none', label: t.university.options.none },
          { value: 'nationalPublic', label: t.university.options.nationalPublic },
          { value: 'private', label: t.university.options.private },
        ]}
      />

      {/* 通学形態は大学進学を選んだ場合だけ有効。非進学時は無効化。 */}
      <ChoiceChips<LivingArrangement>
        legend={t.living.label}
        value={child.livingArrangement ?? 'home'}
        disabled={!universitySelected}
        onChange={(v) => onChange({ ...child, livingArrangement: v })}
        options={[
          { value: 'home', label: t.living.options.home },
          { value: 'away', label: t.living.options.away },
        ]}
      />
      {!universitySelected && <p className="note">{t.living.disabledNote}</p>}
    </fieldset>
  );
}
