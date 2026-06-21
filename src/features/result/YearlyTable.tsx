import { ja } from '../../strings/ja';
import { formatYen } from '../../lib/format';
import type { EducationResult } from '../../schema/types';

const t = ja.result.chart;

export function YearlyTable({ result }: { result: EducationResult }) {
  return (
    <table className="yearly-table">
      <thead>
        <tr>
          <th scope="col">{t.tableYear}</th>
          <th scope="col">{t.tableParentAge}</th>
          <th scope="col">{t.tableTotal}</th>
        </tr>
      </thead>
      <tbody>
        {result.family.map((f) => (
          <tr key={f.year}>
            <td>{f.year}</td>
            <td>{f.parentAge}歳</td>
            <td>{formatYen(f.totalYen)}円</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
