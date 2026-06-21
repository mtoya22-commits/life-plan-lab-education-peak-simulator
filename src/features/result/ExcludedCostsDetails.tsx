import { ja } from '../../strings/ja';

const t = ja.result.excluded;

// 「含まれにくい費用・家庭差が大きい費用」。常時カードを長くしないため折りたたみ。
export function ExcludedCostsDetails() {
  return (
    <details className="collapsible collapsible--muted">
      <summary>{t.title}</summary>
      <div className="collapsible__body">
        <p className="note" style={{ marginTop: 0 }}>
          {t.lead}
        </p>
        <ul className="muted" style={{ margin: 0, paddingLeft: '1.1em' }}>
          {t.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
