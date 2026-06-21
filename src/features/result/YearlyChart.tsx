import { ja } from '../../strings/ja';
import { formatManYen } from '../../lib/format';
import type { EducationResult } from '../../schema/types';
import { YearlyTable } from './YearlyTable';

const t = ja.result.chart;
const CHILD_COLORS = [
  'var(--child-1)',
  'var(--child-2)',
  'var(--child-3)',
  'var(--child-4)',
];
const MAX_BAR_PX = 160;

export function YearlyChart({ result }: { result: EducationResult }) {
  const { family, peak, children } = result;

  // 子ども id -> 色・第N子ラベル
  const childMeta = new Map(
    children.map((c, idx) => ({ id: c.id, idx }) as const).map((m) => [
      m.id,
      { color: CHILD_COLORS[m.idx % CHILD_COLORS.length], label: `第${m.idx + 1}子` },
    ]),
  );

  if (family.length === 0) {
    return (
      <section className="card">
        <h2 className="section-heading">{t.title}</h2>
        <p className="muted">{t.empty}</p>
      </section>
    );
  }

  const maxTotal = Math.max(...family.map((f) => f.totalYen), 1);

  return (
    <section className="card">
      <h2 className="section-heading">{t.title}</h2>

      <div className="chart-scroll">
        <div className="chart" role="img" aria-label={t.title}>
          {family.map((f) => {
            const isPeak = peak !== null && f.year === peak.year;
            return (
              <div
                key={f.year}
                className={`chart__col${isPeak ? ' chart__col--peak' : ''}`}
              >
                <span className="chart__peakbadge">
                  {isPeak ? t.peakBadge : ' '}
                </span>
                <div
                  className="chart__bar"
                  style={{ height: `${(f.totalYen / maxTotal) * MAX_BAR_PX}px` }}
                  aria-hidden="true"
                >
                  {f.byChild
                    .filter((c) => c.costYen > 0)
                    .map((c) => {
                      const meta = childMeta.get(c.id);
                      return (
                        <span
                          key={c.id}
                          className="chart__seg"
                          style={{
                            height: `${(c.costYen / f.totalYen) * 100}%`,
                            background: meta?.color ?? 'var(--accent)',
                          }}
                        />
                      );
                    })}
                </div>
                <span className="chart__axis">
                  {f.year}
                  <br />
                  {t.axisYearShort(f.offset)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {children.length > 1 && (
        <div className="chart-legend">
          {children.map((c, idx) => (
            <span key={c.id} className="chart-legend__item">
              <span
                className="chart-legend__swatch"
                style={{ background: CHILD_COLORS[idx % CHILD_COLORS.length] }}
              />
              第{idx + 1}子
            </span>
          ))}
        </div>
      )}

      {peak && (
        <p className="note" style={{ marginTop: 8 }}>
          {t.peakBadge}：{peak.year}年・{formatManYen(peak.annualCostYen)}。
          {t.universityStartNote}
        </p>
      )}

      <details className="collapsible collapsible--muted" style={{ marginTop: 10 }}>
        <summary>{t.tableToggle}</summary>
        <div className="collapsible__body">
          <YearlyTable result={result} />
        </div>
      </details>
    </section>
  );
}
