import { ja } from '../../strings/ja';
import { formatManYen } from '../../lib/format';
import type { EducationResult } from '../../schema/types';

const t = ja.result.breakdown;

type Row = { key: string; label: string; amountYen: number };

// 教育関連費の構成内訳。engine の breakdown（純粋集計）をそのまま表示し、
// 表示用に別計算を持たない。3 カテゴリ合計 === totalFutureCostYen。
export function CostBreakdown({ result }: { result: EducationResult }) {
  const { k12Yen, universityYen, awayExtraYen } = result.breakdown;
  const total = result.totalFutureCostYen;

  const rows: Row[] = [
    { key: 'k12', label: t.k12Label, amountYen: k12Yen },
    { key: 'university', label: t.universityLabel, amountYen: universityYen },
    { key: 'away', label: t.awayLabel, amountYen: awayExtraYen },
  ].filter((r) => r.amountYen > 0); // 該当しないカテゴリは非表示。

  if (rows.length === 0) return null;

  return (
    <section className="card">
      <h2 className="section-heading">{t.title}</h2>
      <ul className="breakdown-list">
        {rows.map((r) => {
          const percent = total > 0 ? Math.round((r.amountYen / total) * 100) : 0;
          return (
            <li key={r.key} className="breakdown-row">
              <span className="breakdown-row__label">{r.label}</span>
              <span className="breakdown-row__bar" aria-hidden="true">
                <span
                  className="breakdown-row__fill"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="breakdown-row__value">
                {formatManYen(r.amountYen)}
                <span className="breakdown-row__ratio">{t.ratio(percent)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
