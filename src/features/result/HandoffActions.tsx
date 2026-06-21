import { useState } from 'react';
import { ja } from '../../strings/ja';
import { savePayload } from '../../lib/storage';
import { buildEducationPayload } from '../../lib/buildPayload';
import { buildMainSimulatorUrl } from '../../lib/handoffUrl';
import type { EducationResult } from '../../schema/types';
import type { InputState } from '../../lib/inputDefaults';

const t = ja.result.handoff;

export function HandoffActions({
  input,
  result,
}: {
  input: InputState;
  result: EducationResult;
}) {
  const [reflected, setReflected] = useState(false);

  // 確定保存。両ボタンで共通して呼ぶ。
  function persist() {
    const payload = buildEducationPayload(input, result);
    savePayload(payload);
  }

  function onReflect() {
    persist();
    setReflected(true);
  }

  function onGoto() {
    // URL 付与だけでなく、必ず確定保存してから遷移する。
    persist();
    setReflected(true);
    window.location.href = buildMainSimulatorUrl('currentPlan');
  }

  return (
    <section className="card">
      <h2 className="section-heading">{t.title}</h2>
      <p className="muted">{t.lead}</p>
      <div className="handoff-actions">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={onReflect}
        >
          {t.reflectButton}
        </button>
        {reflected && (
          <p className="reflected-note" role="status">
            {t.reflectedNote}
          </p>
        )}
        <button type="button" className="btn btn--block" onClick={onGoto}>
          {t.gotoButton}
        </button>
      </div>
    </section>
  );
}
