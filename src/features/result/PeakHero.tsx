import { ja } from '../../strings/ja';
import { formatManYen, formatParentAgeApprox } from '../../lib/format';
import type { EducationResult } from '../../schema/types';

const t = ja.result.peak;

export function PeakHero({ result }: { result: EducationResult }) {
  const peak = result.peak;
  if (!peak) {
    return (
      <section className="peak-hero fade-rise">
        <p className="peak-hero__label">{ja.result.heading}</p>
        <p className="muted">{ja.result.childPeaks.none}</p>
      </section>
    );
  }
  return (
    <section className="peak-hero fade-rise" aria-label={t.title}>
      <p className="peak-hero__label">{t.title}</p>
      <p className="peak-hero__year">
        {peak.year}
        {t.yearSuffix}
      </p>
      <div className="peak-hero__metrics">
        <span className="peak-hero__metric">
          {t.annualLabel} {formatManYen(peak.annualCostYen)}
        </span>
        <span className="peak-hero__metric">
          {t.parentPrefix} {formatParentAgeApprox(peak.parentAge)}
        </span>
      </div>
    </section>
  );
}
