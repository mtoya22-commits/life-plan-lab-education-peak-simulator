import { ja } from '../../strings/ja';
import { formatManYen, formatParentAgeApprox } from '../../lib/format';
import type { EducationResult } from '../../schema/types';

const t = ja.result.childPeaks;

export function ChildPeaks({ result }: { result: EducationResult }) {
  return (
    <section className="card">
      <h2 className="section-heading">{t.title}</h2>
      {result.children.map((child, idx) => {
        const peak = child.peak;
        return (
          <div
            key={child.id}
            style={{ paddingTop: idx === 0 ? 0 : 12, marginTop: idx === 0 ? 0 : 12 }}
          >
            <p style={{ fontWeight: 600, margin: '4px 0' }}>{t.childLabel(idx + 1)}</p>
            {peak ? (
              <ul style={{ margin: 0, paddingLeft: '1.1em' }} className="muted">
                <li>
                  {peak.year}年・{t.annualLabel} {formatManYen(peak.annualCostYen)}
                </li>
                <li>
                  {t.stageLabel}：{ja.stage[peak.stage]}
                </li>
                <li>
                  {t.parentLabel}：{formatParentAgeApprox(peak.parentAge)}
                </li>
              </ul>
            ) : (
              <p className="muted">{t.none}</p>
            )}
          </div>
        );
      })}
    </section>
  );
}
