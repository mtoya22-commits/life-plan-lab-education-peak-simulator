import { ja } from '../../strings/ja';
import { formatYen } from '../../lib/format';
import type { EducationResult } from '../../schema/types';
import type { InputState } from '../../lib/inputDefaults';
import { PeakHero } from './PeakHero';
import { IncludedCostsCard } from './IncludedCostsCard';
import { CostBreakdown } from './CostBreakdown';
import { ExcludedCostsDetails } from './ExcludedCostsDetails';
import { ChildPeaks } from './ChildPeaks';
import { YearlyChart } from './YearlyChart';
import { OverlapNote } from './OverlapNote';
import { AssumptionsDetails } from './AssumptionsDetails';
import { HandoffActions } from './HandoffActions';

const t = ja.result;

export function ResultScreen({
  input,
  result,
  onBack,
}: {
  input: InputState;
  result: EducationResult;
  onBack: () => void;
}) {
  // 下宿・一人暮らしの子がいると、総額に自宅外通学の追加生活費が含まれる。
  const hasAway = input.children.some(
    (c) => c.universityPlan !== 'none' && c.livingArrangement === 'away',
  );
  const totalTitle = hasAway ? t.total.titleWithAway : t.total.title;

  return (
    <div className="screen screen--result">
      <PeakHero result={result} />

      <section className="card">
        <h2 className="section-heading">{totalTitle}</h2>
        <p className="big-figure" aria-label={`${totalTitle} ${formatYen(result.totalFutureCostYen)}円`}>
          {formatYen(result.totalFutureCostYen)}円
        </p>
        {hasAway && <p className="note">{t.total.awayBadge}</p>}
        <p className="note">{t.total.note}</p>
      </section>

      <IncludedCostsCard result={result} />
      <CostBreakdown result={result} />
      <ExcludedCostsDetails />

      <ChildPeaks result={result} />
      <YearlyChart result={result} />
      <OverlapNote result={result} />

      <p className="note">{t.disclaimer}</p>
      <AssumptionsDetails />

      <HandoffActions input={input} result={result} />

      <button type="button" className="btn btn--block" onClick={onBack}>
        {t.backToInput}
      </button>
    </div>
  );
}
