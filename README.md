# 教育費ピークシミュレーター（LIFE PLAN LAB）

子どもの年齢と進学方針から、**教育費が大きくなる時期・そのときの親年齢・子ども複数の
費用が重なる年・今後の教育費総額の概算**を整理する小型シミュレーターです。
総額だけでなく「どの年に負担が重なるか」を見て、総合版「生活設計シミュレーター」で
住宅ローン・生活費・働き方と重ねて確認する入口になります。

> 未来を当てるためではなく、未来を整理するためのツールです。煽らない・止めない・
> いつでも再計算できる、を方針にしています。

## 技術構成

- React + Vite + TypeScript（strict）/ Vitest（jsdom）
- 計算は純粋関数（`src/lib/educationEngine.ts`）。前提値は `src/lib/educationAssumptions.ts` に集約
- 文言は `src/strings/ja.ts` に一元化
- 年次チャートは依存なしの自作 SVG/CSS（`src/features/result/YearlyChart.tsx`）

## 開発

```bash
npm install
npm run dev        # 開発サーバ
npm test           # Vitest（全件）
npm run typecheck  # tsc -b
npm run build      # tsc -b && vite build（dist/ 生成）
```

## ドキュメント

- `docs/DESIGN_HANDOFF.md` … デザイン/UX/アーキテクチャ方針（共通）
- `docs/shared-tokens.css` … デザイントークン（共通）
- `docs/EMBED.md` … WordPress 等への iframe 埋め込み手順（本アプリ用）
- `docs/INTEGRATION.md` … 総合版への引き継ぎ（Stage 2 申し送り）

## 前提値の出典

`src/lib/educationAssumptions.ts` にコメントで明記。概要:

- 小・中・高：文部科学省「令和5年度 子供の学習費調査」
- 国公立大学：国立大学の授業料・入学料の標準額
- 私立大学：文部科学省「令和7年度 私立大学等の入学者に係る学生納付金等調査」
- 自宅外通学の追加費用：日本学生支援機構（JASSO）「令和6年度 学生生活調査」
  （生活費総額は加算せず、住居・光熱費相当の追加分のみ。総合版の生活費との二重計上を回避）

すべて「現在の金額ベースの概算」で、インフレ・運用は扱いません。

## デプロイ

`main` への push または手動実行で `.github/workflows/deploy-pages.yml` が GitHub Pages へ
公開します（要：リポジトリ Settings → Pages のソースを「GitHub Actions」に設定）。
Pull Request では `.github/workflows/ci.yml` が typecheck・test・build を実行します。
