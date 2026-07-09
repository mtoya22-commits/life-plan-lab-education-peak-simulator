// jsdom は window.scrollTo 未実装で、呼ばれるたびに
// "Not implemented: Window's scrollTo() method" を stderr に出す（実害はないがログを汚す）。
// 既定を no-op に差し替えてノイズを止める。writable / configurable にしてあるため、
// 個別テストの vi.spyOn(window, 'scrollTo') やモック（restore で no-op に戻る）とは競合しない。
// 本番コード側で try/catch や条件分岐を増やして隠す対応はしない（テスト環境の都合はここで吸収する）。
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: () => {},
    writable: true,
    configurable: true,
  });
}
