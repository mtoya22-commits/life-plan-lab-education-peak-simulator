import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import App from '../../src/App';

// モバイルUX: 画面遷移（intro→input 等）で先頭へ戻す回帰テスト。
// 単独表示 fallback（window.scrollTo）と親への scrollTop 通知の両方を確認する。

describe('画面遷移時の先頭スクロール', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>;
  let postSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    scrollSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    postSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    scrollSpy.mockRestore();
    postSpy.mockRestore();
    localStorage.clear();
  });

  it('intro→input で window.scrollTo（単独表示 fallback）と scrollTop 通知が走る', () => {
    const { getByText } = render(<App />);
    scrollSpy.mockClear();
    postSpy.mockClear();

    fireEvent.click(getByText('教育費の流れを見てみる'));

    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    const scrollTopMsgs = postSpy.mock.calls.filter(
      (c) => (c[0] as { type?: string })?.type === 'lifeplanlab:scrollTop',
    );
    expect(scrollTopMsgs.length).toBeGreaterThanOrEqual(1);
    expect(scrollTopMsgs[0][0]).toEqual({
      type: 'lifeplanlab:scrollTop',
      source: 'education-peak-simulator',
    });
  });
});
