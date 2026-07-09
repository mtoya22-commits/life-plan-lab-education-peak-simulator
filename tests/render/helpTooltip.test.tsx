import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { HelpTooltip, bubbleShiftX } from '../../src/features/input/HelpTooltip';

describe('HelpTooltip 開閉', () => {
  afterEach(cleanup);

  it('？で開閉でき、aria-expanded が追従する', () => {
    const { container } = render(<HelpTooltip text="説明" label="項目の説明" />);
    const btn = container.querySelector('.help__trigger') as HTMLButtonElement;
    expect(container.querySelector('.help__bubble')).toBeNull();
    fireEvent.click(btn);
    expect(container.querySelector('.help__bubble')!.textContent).toContain('説明');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(container.querySelector('.help__bubble')).toBeNull();
  });
});

// モバイル375px契約: bubble を画面内へ収めるシフト量の純関数テスト。
// 実レイアウト幅は jsdom で保証しない（375px は実機/ブラウザ確認）。
describe('bubbleShiftX (viewport clamp)', () => {
  it('収まっていれば 0', () => {
    expect(bubbleShiftX(100, 340, 375)).toBe(0);
  });
  it('右端のはみ出し分だけ左へシフト', () => {
    expect(bubbleShiftX(160, 400, 375)).toBe(-37);
  });
  it('左端が margin を割る場合は右へ戻す', () => {
    expect(bubbleShiftX(-20, 220, 375)).toBe(32);
  });
  it('画面より広い場合は左端保護を優先', () => {
    expect(0 + bubbleShiftX(0, 500, 375)).toBe(12);
  });
});
