import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EMBED_SOURCE,
  isEmbedded,
  postEmbeddedHeight,
  postEmbeddedScrollTop,
  resetEmbedHeightState,
} from '../../src/lib/embed';

describe('embed（iframe 通信）', () => {
  let postSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    resetEmbedHeightState();
    postSpy = vi.spyOn(window.parent, 'postMessage').mockImplementation(() => {});
  });
  afterEach(() => {
    postSpy.mockRestore();
  });

  it('単独表示（jsdom: self === top）では isEmbedded が false', () => {
    expect(isEmbedded()).toBe(false);
  });

  it('resize メッセージを source 付きで送る', () => {
    postEmbeddedHeight(500);
    expect(postSpy).toHaveBeenCalledWith(
      { type: 'lifeplanlab:resize', source: EMBED_SOURCE, height: 500 },
      '*',
    );
  });

  it('scrollTop メッセージを source 付きで送る', () => {
    postEmbeddedScrollTop();
    expect(postSpy).toHaveBeenCalledWith(
      { type: 'lifeplanlab:scrollTop', source: EMBED_SOURCE },
      '*',
    );
  });

  it('高さの微小差分（2px未満）では無駄に送らない', () => {
    postEmbeddedHeight(500);
    expect(postSpy).toHaveBeenCalledTimes(1);
    postEmbeddedHeight(501); // 1px 差 → 送らない
    expect(postSpy).toHaveBeenCalledTimes(1);
    postEmbeddedHeight(503); // 3px 差 → 送る
    expect(postSpy).toHaveBeenCalledTimes(2);
  });
});

describe('docs/EMBED.md（埋め込み規約）', () => {
  const md = readFileSync(resolve(process.cwd(), 'docs/EMBED.md'), 'utf-8');

  it('source 識別子を含む', () => {
    expect(md).toContain('education-peak-simulator');
    expect(md).toContain('data-lifeplanlab-source');
  });
  it('高さ調整（resize）を含む', () => {
    expect(md).toContain('lifeplanlab:resize');
    expect(md).toMatch(/MIN_HEIGHT/);
    expect(md).toMatch(/MAX_HEIGHT/);
  });
  it('scrollTop を含む', () => {
    expect(md).toContain('lifeplanlab:scrollTop');
  });
});
