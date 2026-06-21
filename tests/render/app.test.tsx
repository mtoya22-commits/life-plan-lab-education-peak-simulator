import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import App from '../../src/App';
import { ResultScreen } from '../../src/features/result/ResultScreen';
import { runEducation } from '../../src/lib/educationEngine';
import { loadPayload, PAYLOAD_KEY } from '../../src/lib/storage';
import type { InputState } from '../../src/lib/inputDefaults';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe('App（画面遷移）', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('intro の CTA で入力画面へ進む', () => {
    render(<App />);
    expect(screen.getByText('教育費ピークシミュレーター')).toBeTruthy();
    fireEvent.click(screen.getByText('教育費の流れを見てみる'));
    expect(screen.getByText('条件を入力する')).toBeTruthy();
  });
});

describe('ResultScreen（子2人・重なり・反映）', () => {
  // 第1子18歳(私立大・自宅), 第2子16歳(私立大方針・公立高) → 重なる年がある。
  const input: InputState = {
    parentAge: 48,
    baselineYear: 2026,
    children: [
      {
        id: 'a',
        currentAge: 18,
        juniorHighHighSchoolPlan: 'public',
        universityPlan: 'private',
        livingArrangement: 'home',
      },
      {
        id: 'b',
        currentAge: 16,
        juniorHighHighSchoolPlan: 'public',
        universityPlan: 'private',
        livingArrangement: 'home',
      },
    ],
  };
  const result = runEducation({
    parentAge: input.parentAge!,
    baselineYear: input.baselineYear,
    children: input.children,
  });

  it('ピーク・子別ピーク・重なり時期が表示される', () => {
    render(<ResultScreen input={input} result={result} onBack={() => {}} />);
    expect(screen.getByText('教育費のピーク')).toBeTruthy();
    expect(screen.getByText('子ども別の教育費ピーク')).toBeTruthy();
    expect(screen.getByText('教育費が重なりやすい時期')).toBeTruthy();
  });

  it('反映ボタンで lifePlanLab:education に確定保存され、保存前は空', () => {
    expect(window.localStorage.getItem(PAYLOAD_KEY)).toBeNull();
    render(<ResultScreen input={input} result={result} onBack={() => {}} />);
    fireEvent.click(
      screen.getByText('この教育費条件を生活設計に反映する'),
    );
    const payload = loadPayload()!;
    expect(payload).not.toBeNull();
    expect(payload.source).toBe('currentPlan');
    expect(payload.children.length).toBe(2);
    expect(payload.peakParentAge).toBe(payload.parentAge + payload.peakYearOffset);
    expect(screen.getByText('生活設計に反映する教育費条件として保存しました')).toBeTruthy();
  });
});
