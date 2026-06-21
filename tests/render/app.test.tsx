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

describe('ResultScreen（含む費用の説明UI・内訳・見出し）', () => {
  function build(livingArrangement: 'home' | 'away') {
    const input: InputState = {
      parentAge: 45,
      baselineYear: 2026,
      children: [
        {
          id: 'a',
          currentAge: 16,
          juniorHighHighSchoolPlan: 'public',
          universityPlan: 'private',
          livingArrangement,
        },
      ],
    };
    const result = runEducation({
      parentAge: input.parentAge!,
      baselineYear: input.baselineYear,
      children: input.children,
    });
    return { input, result };
  }

  it('「この試算に含まれる主な費用」カードと「含まれにくい費用」折りたたみが表示される', () => {
    const { input, result } = build('home');
    render(<ResultScreen input={input} result={result} onBack={() => {}} />);
    expect(screen.getByText('この試算に含まれる主な費用')).toBeTruthy();
    expect(screen.getByText('含まれにくい費用・家庭差が大きい費用')).toBeTruthy();
    // 大学自宅通学の注意書き（予備校代等は含まない）が出る。
    expect(
      screen.getByText(/大学受験のための予備校代/),
    ).toBeTruthy();
  });

  it('総額見出し：下宿なしは「教育費総額」、下宿ありは「教育関連費総額」', () => {
    const home = build('home');
    const { unmount } = render(
      <ResultScreen input={home.input} result={home.result} onBack={() => {}} />,
    );
    expect(screen.getByText('今後の教育費総額（概算）')).toBeTruthy();
    expect(screen.queryByText('今後の教育関連費総額（概算）')).toBeNull();
    unmount();

    const away = build('away');
    render(
      <ResultScreen input={away.input} result={away.result} onBack={() => {}} />,
    );
    expect(screen.getByText('今後の教育関連費総額（概算）')).toBeTruthy();
  });

  it('内訳：下宿なしは「自宅外通学による追加生活費」を表示しない／下宿ありは表示する', () => {
    const home = build('home');
    const { unmount } = render(
      <ResultScreen input={home.input} result={home.result} onBack={() => {}} />,
    );
    expect(screen.getByText('教育関連費の内訳')).toBeTruthy();
    expect(screen.getByText('大学の納付金')).toBeTruthy();
    expect(screen.queryByText('自宅外通学による追加生活費')).toBeNull();
    unmount();

    const away = build('away');
    render(
      <ResultScreen input={away.input} result={away.result} onBack={() => {}} />,
    );
    // 内訳カテゴリとして表示される（複数箇所に出るため getAllByText）。
    expect(screen.getAllByText('自宅外通学による追加生活費').length).toBeGreaterThan(0);
  });
});
