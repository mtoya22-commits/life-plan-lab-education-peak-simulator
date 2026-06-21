import { ja } from '../../strings/ja';

const t = ja.result.assumptions;

export function AssumptionsDetails() {
  return (
    <details className="collapsible collapsible--muted">
      <summary>{t.toggle}</summary>
      <div className="collapsible__body">
        <ul className="muted" style={{ margin: 0, paddingLeft: '1.1em' }}>
          <li>{t.ageBased}</li>
          <li>{t.model}</li>
          <li>{t.universityFirstYear}</li>
          <li>{t.away}</li>
          <li>{t.awayInTotal}</li>
          <li>{t.excluded}</li>
          <li>{t.variance}</li>
        </ul>
        <p style={{ fontWeight: 600, marginBottom: 4, marginTop: 12 }}>
          {t.sourcesTitle}
        </p>
        <ul className="note" style={{ margin: 0, paddingLeft: '1.1em' }}>
          {t.sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
