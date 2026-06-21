import { ja } from '../../strings/ja';

const t = ja.intro;

export function IntroScreen({
  canResume,
  onStart,
  onResume,
  onFresh,
}: {
  canResume: boolean;
  onStart: () => void;
  onResume: () => void;
  onFresh: () => void;
}) {
  return (
    <div className="screen fade-rise">
      <h1 className="app-title">{t.title}</h1>
      <p className="pre-line">{t.description}</p>
      <p className="note pre-line">{t.note}</p>

      {canResume ? (
        <div className="card">
          <p style={{ marginTop: 0, fontWeight: 600 }}>{t.resume.title}</p>
          <div className="handoff-actions">
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={onResume}
            >
              {t.resume.resumeButton}
            </button>
            <button type="button" className="btn btn--block" onClick={onFresh}>
              {t.resume.freshButton}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={onStart}
        >
          {t.cta}
        </button>
      )}
    </div>
  );
}
