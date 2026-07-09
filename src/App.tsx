import { useEffect, useMemo, useRef, useState } from 'react';
import { IntroScreen } from './features/intro/IntroScreen';
import { InputScreen } from './features/input/InputScreen';
import { ResultScreen } from './features/result/ResultScreen';
import { runEducation } from './lib/educationEngine';
import {
  clearDraft,
  isDraftResumable,
  loadDraft,
  saveDraft,
} from './lib/storage';
import {
  createDefaultInput,
  draftToInput,
  inputToDraft,
  type InputState,
} from './lib/inputDefaults';
import { observeRootHeight, postEmbeddedScrollTop } from './lib/embed';

type Phase = 'intro' | 'input' | 'result';

export default function App() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [input, setInput] = useState<InputState>(() => createDefaultInput());
  const [canResume, setCanResume] = useState(false);

  // 起動時に下書きを確認（実質空でなければ再開カードを出す）。
  useEffect(() => {
    const draft = loadDraft();
    if (isDraftResumable(draft)) setCanResume(true);
  }, []);

  // 入力をデバウンス保存（下書き）。確定保存は反映ボタン側でのみ行う。
  const debounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (phase === 'intro') return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      saveDraft(inputToDraft(input));
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [input, phase]);

  // iframe 高さの自動追従（#root の ResizeObserver）。
  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    return observeRootHeight(root);
  }, []);

  // 画面遷移・再計算時に先頭へ戻す。
  // 埋め込み時: 親ページへ先頭スクロールを依頼（スクロールは親側にある）。
  // 単独表示時: 自分の window と内側スクロールコンテナ（.step-content）をリセットする。
  useEffect(() => {
    document.querySelector('.step-content')?.scrollTo?.({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
    postEmbeddedScrollTop();
  }, [phase]);

  const result = useMemo(
    () =>
      runEducation({
        parentAge: input.parentAge ?? 0,
        baselineYear: input.baselineYear,
        children: input.children,
      }),
    [input],
  );

  function startFresh() {
    clearDraft();
    setInput(createDefaultInput());
    setCanResume(false);
    setPhase('input');
  }

  function resume() {
    const draft = loadDraft();
    if (draft) setInput(draftToInput(draft));
    setCanResume(false);
    setPhase('input');
  }

  return (
    <div className="app">
      {phase === 'intro' && (
        <IntroScreen
          canResume={canResume}
          onStart={() => setPhase('input')}
          onResume={resume}
          onFresh={startFresh}
        />
      )}

      {phase === 'input' && (
        <InputScreen
          input={input}
          onChange={setInput}
          onSeeResult={() => setPhase('result')}
        />
      )}

      {phase === 'result' && (
        <ResultScreen
          input={input}
          result={result}
          onBack={() => setPhase('input')}
        />
      )}
    </div>
  );
}
