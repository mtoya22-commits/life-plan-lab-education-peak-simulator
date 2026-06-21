# 教育費ピークシミュレーター を WordPress 等に iframe 埋め込みする

このドキュメントは、ビルド済みの「教育費ピークシミュレーター」を WordPress 固定ページ・Note 記事・LP などへ iframe で埋め込む際の最小・推奨実装をまとめたものです。

姉妹アプリ（総合版 生活設計シミュレーター・生活費見直し・住宅ローン）と同じ思想で、**スクロールは親ページ 1 本** にまとめる前提です。アプリ側は `<html>` に `data-embedded="true"` / `class="is-embedded"` が付いた時点で内側スクロールと sticky bottom-nav を自動解除し、コンテンツ高さに合わせて伸びるレイアウトに切り替わります。

> **重要（親側の禁止事項）**: WordPress 親ページ側で iframe を
> `position: sticky`、`height: 100vh`、`height: 100dvh` に固定しないでください。
> これらは高さ自動追従・画面遷移時の先頭スクロール・親ページへのスクロール集約と
> 相性が悪く、空白や二重スクロールの原因になります。必ず本ドキュメントの最新スニペット
> （`lifeplanlab:resize` / `lifeplanlab:scrollTop` を使う方式）を使用してください。

## アプリ → 親ページ への通知

アプリは以下 2 種のメッセージを `window.parent.postMessage(..., '*')` で送ります。受信は任意（仕掛けなくてもアプリは単独表示として動きます）。

| type | 送信タイミング | payload |
|---|---|---|
| `lifeplanlab:resize` | 起動直後・コンテンツ高さの変化時 | `{ type, source: 'education-peak-simulator', height: number }` |
| `lifeplanlab:scrollTop` | 画面遷移（intro→input→result→input）・再計算時 | `{ type, source: 'education-peak-simulator' }` |

`source: 'education-peak-simulator'` を必ずチェックして、他アプリ（`life-plan-simulator` など）の同名メッセージと衝突しないようにしてください。**同じページに複数の iframe があっても、`source` と「送信元 iframe（`event.source`）の照合」で取り違えを防ぎます**（下記スニペット参照）。

## 最小実装（コピペで動く）

WordPress カスタム HTML ブロックや、カスタムテーマの固定ページテンプレートに貼り付けます。`data-lifeplanlab-source` 属性で、このアプリ用 iframe を識別します。

```html
<div class="lifeplanlab-embed" style="max-width: 760px; margin: 0 auto;">
  <iframe
    id="education-peak-frame"
    data-lifeplanlab-source="education-peak-simulator"
    data-base-src="https://mtoya22-commits.github.io/life-plan-lab-education-peak-simulator/"
    title="教育費ピークシミュレーター"
    style="width: 100%; min-height: 600px; border: 0; display: block;"
    loading="lazy"
    scrolling="no"
  ></iframe>
</div>

<script>
(function () {
  var SOURCE = 'education-peak-simulator';
  var MIN_HEIGHT = 400;   // 高さの下限（空白増殖と過小化を防ぐ）
  var MAX_HEIGHT = 20000; // 高さの上限（異常値ガード）

  var frame = document.querySelector(
    'iframe[data-lifeplanlab-source="' + SOURCE + '"]'
  );
  if (!frame) return;

  // base src をセット（必要なら将来ここで許可済み params を append。下記参照）。
  var base = frame.getAttribute('data-base-src') || frame.getAttribute('src') || '';
  frame.src = base;

  window.addEventListener('message', function (e) {
    var data = e && e.data;
    if (!data || data.source !== SOURCE) return;
    // 送信元 iframe を照合（複数 iframe 共存時の取り違え防止）。
    if (e.source !== frame.contentWindow) return;

    if (data.type === 'lifeplanlab:resize' && typeof data.height === 'number') {
      var h = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(data.height)));
      frame.style.height = h + 'px';
    }

    if (data.type === 'lifeplanlab:scrollTop') {
      var top = frame.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: top - 8, behavior: 'smooth' });
    }
  });
})();
</script>
```

## 複数 iframe を同じページに置く場合

`data-lifeplanlab-source` ごとに上記スクリプトの `SOURCE` を変えて複数回設置するか、
`document.querySelectorAll('iframe[data-lifeplanlab-source]')` で全 iframe をループし、
受信時に **`data.source` と `e.source === frame.contentWindow` の両方** で対象 iframe を
特定してください。これにより、教育費ピークシミュレーターと総合版が同居しても、
互いの `lifeplanlab:resize` / `lifeplanlab:scrollTop` が混線しません。

## 将来：親 URL から子 iframe へ教育費パラメータを渡す（許可リスト拡張方法）

現状、このアプリは親 → 子の URL パラメータを必要としません（条件は localStorage
`lifePlanLab:education` と、総合版遷移時の `educationSource=currentPlan` で受け渡します）。

将来、親ページの URL に付いた教育費パラメータを子 iframe へ持ち越したくなった場合は、
姉妹アプリと同じ「許可リスト方式」で拡張します。

```html
<script>
(function () {
  // 子 iframe に渡してよいキーだけを列挙（許可リスト）。許可外は黙って捨てる。
  var ALLOW = [
    'educationSource'
    // 例: 'educationParentAge', 'educationBaselineYear' などを将来追加
  ];
  var SOURCE = 'education-peak-simulator';
  var frame = document.querySelector(
    'iframe[data-lifeplanlab-source="' + SOURCE + '"]'
  );
  if (!frame) return;

  var base = frame.getAttribute('data-base-src') || frame.getAttribute('src') || '';
  var parent = new URLSearchParams(location.search);
  var allowed = new URLSearchParams();
  for (var i = 0; i < ALLOW.length; i++) {
    var v = parent.get(ALLOW[i]);
    if (v !== null && v !== '') allowed.set(ALLOW[i], v);
  }
  var qs = allowed.toString();
  frame.src = qs ? base + (base.indexOf('?') >= 0 ? '&' : '?') + qs : base;
})();
</script>
```

許可リストを増やすときは、**この `ALLOW` 配列**と、子アプリ側の受け取り実装（および
`src/lib/embed.ts` 周辺・本ドキュメント）を必ず同時に更新してください。通常アクセス時
（params 無し）は base src と完全に同じ動作になります。

## チェックリスト

- [ ] iframe の `data-base-src` に教育費ピークシミュレーターのデプロイ URL を入れている
- [ ] iframe に `data-lifeplanlab-source="education-peak-simulator"` を付けている
- [ ] iframe に `scrolling="no"` を付け、内側スクロールが出ないようにしている
- [ ] `lifeplanlab:resize` リスナで `iframe.style.height` を追従させている
- [ ] 高さを `Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, ...))` で clamp している
- [ ] `lifeplanlab:scrollTop` リスナで親ページを iframe 先頭へスクロールしている
- [ ] `data.source === 'education-peak-simulator'` と `e.source === frame.contentWindow` の両方で照合している
- [ ] 親側で `position: sticky` / `height: 100vh` / `height: 100dvh` を **使っていない**

## 単独表示（GitHub Pages 直リンク）でのフォールバック

`<html>` に `is-embedded` が付かないため、アプリは `100svh` + `overflow: hidden` +
`overflow-y: auto` + sticky bottom-nav の inner-scroll パターンで描画されます。
スマホ単独利用時の操作性はこの構成が最も安定するため、埋め込みと単独の双方を
1 つのビルド成果物で両立します。

## 検証ポイント

1. PC ブラウザで親ページを開く → 入力フォームをスクロール → 親ページ 1 本のスクロールだけが動く
2. 「教育費の流れを見る」等で画面が変わる → 親ページが iframe 先頭へスムーススクロールする
3. 折りたたみ展開・グラフ表示などで iframe 高さが増えると親 iframe も追従する
4. iframe 高さが空白で勝手に増殖しない（送信側で 2px 未満の振動を無視している）
5. 同じページに総合版 iframe も置いた場合に、互いのメッセージが混線しない
