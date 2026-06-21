import { ja } from '../../strings/ja';
import type { EducationResult } from '../../schema/types';

const t = ja.result.overlap;

// 複数子で費用が重なりやすい時期。煽らない表現に限定する。
export function OverlapNote({ result }: { result: EducationResult }) {
  if (!result.overlap) return null;
  const { startYear, endYear } = result.overlap;
  return (
    <section className="card">
      <h2 className="section-heading">{t.title}</h2>
      <p className="muted">{t.body(startYear, endYear)}</p>
    </section>
  );
}
