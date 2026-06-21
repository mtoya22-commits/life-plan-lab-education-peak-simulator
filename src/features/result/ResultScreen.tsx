import { ja } from '../../strings/ja';
import { formatYen } from '../../lib/format';
import type { EducationResult } from '../../schema/types';
import type { InputState } from '../../lib/inputDefaults';
import { PeakHero } from './PeakHero';
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
  return (
    <div className="screen screen--result">
      <PeakHero result={result} />

      <section className="card">
        <h2 className="section-heading">{t.total.title}</h2>
        <p className="big-figure" aria-label={`${t.total.title} ${formatYen(result.totalFutureCostYen)}円`}>
          {formatYen(result.totalFutureCostYen)}円
        </p>
        <p className="note">{t.total.note}</p>
      </section>

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
