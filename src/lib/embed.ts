// WordPress iframe 埋め込み対応。親ページへ高さ／先頭スクロールを通知する。
// メッセージには source を必ず付け、複数 iframe 共存時の誤作動を防ぐ。

export const EMBED_SOURCE = 'education-peak-simulator';

export type EmbedResizeMessage = {
  type: 'lifeplanlab:resize';
  source: typeof EMBED_SOURCE;
  height: number;
};

export type EmbedScrollTopMessage = {
  type: 'lifeplanlab:scrollTop';
  source: typeof EMBED_SOURCE;
};

// iframe に埋め込まれているか。SSR/例外時も安全側（false）に倒す。
export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // クロスオリジンで window.top にアクセスできない＝埋め込まれている。
    return true;
  }
}

function postToParent(message: EmbedResizeMessage | EmbedScrollTopMessage): void {
  try {
    window.parent.postMessage(message, '*');
  } catch {
    /* no-op */
  }
}

// 直近に送った高さ。微小な揺れ（2px 未満）は送らず無限更新を防ぐ。
let lastSentHeight = 0;
const HEIGHT_EPSILON = 2;

export function postEmbeddedHeight(height: number): void {
  const h = Math.round(height);
  if (!Number.isFinite(h) || h <= 0) return;
  if (Math.abs(h - lastSentHeight) < HEIGHT_EPSILON) return;
  lastSentHeight = h;
  postToParent({ type: 'lifeplanlab:resize', source: EMBED_SOURCE, height: h });
}

// テスト用：内部状態をリセットする。
export function resetEmbedHeightState(): void {
  lastSentHeight = 0;
}

export function postEmbeddedScrollTop(): void {
  postToParent({ type: 'lifeplanlab:scrollTop', source: EMBED_SOURCE });
}

// #root の高さ変化を監視して親へ通知する。返り値で監視を停止できる。
export function observeRootHeight(target: HTMLElement): () => void {
  if (typeof ResizeObserver === 'undefined') {
    return () => {};
  }
  const ro = new ResizeObserver(() => {
    postEmbeddedHeight(target.getBoundingClientRect().height);
  });
  ro.observe(target);
  // 初回も一度送る。
  postEmbeddedHeight(target.getBoundingClientRect().height);
  return () => ro.disconnect();
}
