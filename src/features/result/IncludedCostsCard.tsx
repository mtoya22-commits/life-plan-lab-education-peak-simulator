import { ja } from '../../strings/ja';
import type { EducationResult } from '../../schema/types';

const t = ja.result.included;

// 総額のすぐ下に常時表示する「この試算に含まれる主な費用」。
// 入力条件（内訳の有無）に応じて該当セクションのみ表示する。
export function IncludedCostsCard({ result }: { result: EducationResult }) {
  const { k12Yen, universityYen, awayExtraYen } = result.breakdown;
  const hasK12 = k12Yen > 0;
  const hasUniversity = universityYen > 0;
  const hasAway = awayExtraYen > 0;

  // どのカテゴリも無い場合は表示しない（実質ありえないが防御的に）。
  if (!hasK12 && !hasUniversity && !hasAway) return null;

  return (
    <section className="card">
      <h2 className="section-heading">{t.title}</h2>
      <dl className="included-list">
        {hasK12 && (
          <div className="included-item">
            <dt className="included-item__term">{t.k12Title}</dt>
            <dd className="included-item__desc">
              {t.k12Body}
              <span className="note">{t.k12Note}</span>
            </dd>
          </div>
        )}
        {hasUniversity && (
          <div className="included-item">
            <dt className="included-item__term">{t.universityTitle}</dt>
            <dd className="included-item__desc">
              {t.universityBody}
              <span className="note">{t.universityNote}</span>
            </dd>
          </div>
        )}
        {hasAway && (
          <div className="included-item">
            <dt className="included-item__term">{t.awayTitle}</dt>
            <dd className="included-item__desc">
              {t.awayBody}
              <span className="note">{t.awayNote}</span>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
