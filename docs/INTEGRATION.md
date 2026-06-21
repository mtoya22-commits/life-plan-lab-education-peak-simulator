# 総合版への引き継ぎ（Stage 2 申し送り）

教育費ピークシミュレーター（以下「本アプリ」）で入力・試算した教育費条件を、
総合版「生活設計シミュレーター」（本番 `https://fire-lifeplan-lab.com/life-plan-simulator/`）
で受け取り、人生全体（住宅ローン・生活費・働き方）と重ねて確認できるようにするための
**総合版リポジトリ側 実装依頼**です。

> 本 Stage では総合版リポジトリ自体は変更しません。本ドキュメントは、次工程で総合版側に
> 受け取り実装（Stage 2）を依頼するための仕様書です。
> **総合版側の受け取り実装が完了するまで「総合版に完全反映済み」とは報告しないこと。**

---

## 1. 読み込む localStorage キー

| キー | 用途 | 書き込み主体 |
|---|---|---|
| `lifePlanLab:education` | 総合版へ渡す**確定**データ（本仕様の対象） | 本アプリの「反映」「人生全体の資産推移で見る」操作時 |
| `lifePlanLab:educationDraft` | 本アプリの入力途中の**下書き**（総合版は読まない） | 本アプリのデバウンス保存 |

総合版が読むのは **`lifePlanLab:education` のみ**。下書きキーは無視すること。

---

## 2. Payload 型（`lifePlanLab:education` の中身）

本アプリの `src/schema/types.ts`・`src/lib/buildPayload.ts` と一致する。

```ts
type EducationSource = 'currentPlan';

type EducationChildPayload = {
  id: string;
  currentAge: number;
  juniorHighHighSchoolPlan: 'public' | 'publicToPrivateHigh' | 'privateIntegrated';
  universityPlan: 'none' | 'nationalPublic' | 'private';
  livingArrangement?: 'home' | 'away'; // 大学進学なしのときは省略される
};

type EducationPayload = {
  source: EducationSource;        // 'currentPlan'
  baselineYear: number;           // 基準年（西暦）
  parentAge: number;              // 基準年時点の親年齢
  children: EducationChildPayload[];
  peakYear: number;               // 教育費ピーク年（西暦）
  peakYearOffset: number;         // peakYear - baselineYear
  peakParentAge: number;          // parentAge + peakYearOffset
  peakAnnualCostYen: number;      // ピーク年の家族年間教育費（円）
  totalFutureCostYen: number;     // 今後の教育費総額（円・概算）
  assumptionVersion: string;      // 前提値バージョン（例 '2026.06'）
  savedAt: string;                // ISO8601
  version: number;                // スキーマバージョン（現状 1）
};
```

- 年次明細は**含めない**（重複保存しない）。総合版は `children` ＋ `baselineYear` ＋
  `parentAge` から年次を**再計算可能**。本アプリの計算ロジック（`educationEngine.ts` /
  `educationAssumptions.ts`）を移植・参照して再現すること。
- `assumptionVersion` が総合版側の想定と異なる場合は、概算前提が更新された可能性がある旨を
  バナー等で示す（破壊的に拒否はしない）。

---

## 3. URL の `educationSource`

総合版へ遷移する際、本アプリは本番 URL に `educationSource=currentPlan` を付与する。

```
https://fire-lifeplan-lab.com/life-plan-simulator/?educationSource=currentPlan
```

- これは「教育費条件が localStorage に用意されている」ことを総合版へ知らせる**補助フラグ**。
- 実データは URL ではなく `lifePlanLab:education` に入っている（URL に明細は載せない）。

---

## 4. 反映ルール（優先順位）

総合版が値を採用する優先順位:

1. **URL パラメータ**（最優先・明示的な持ち込み）
2. **localStorage `lifePlanLab:education`**（URL に値が無いときの取り込み元）
3. **総合版でユーザーが手動編集した値**（取り込み後に編集された場合は手動値を優先）

すなわち、取り込みは「初回／明示時のみ」。**一度ユーザーが総合版側で教育費を手動編集したら、
本アプリの値で勝手に上書きしない**こと（編集済みフラグで管理する）。

---

## 5. 既存フィールドへの反映（重要）

受け取った値は、総合版の教育費入力で**実際に画面・計算で使われる既存フィールド**へ反映すること。
バナー表示だけで終わらせない。

- 子どもの人数・各子の現在年齢・中高方針・大学方針・通学形態を、総合版の教育費入力欄へ橋渡しする。
- 本アプリと総合版で進学方針の選択肢が完全一致しない場合は、総合版側のマッピング表で吸収する。
- **ざっくり診断・しっかり診断の両モードで取り込みを維持すること**（片方だけにしない）。
- 既存の教育費ロジックを壊さないこと（本データはあくまで入力プリフィルで、計算式は総合版のもの）。

### 下宿（自宅外通学）追加費用の扱い（概算イベントとして加算）
本アプリの下宿（`livingArrangement: 'away'`）は、**自宅外通学による追加生活費の参考差額**を
大学在学中(18〜21歳)の各年に上乗せしている。

```
自宅外通学による追加生活費
  = 自宅外通学生（下宿・アパート・その他）の生活費 − 自宅生の生活費
  = 1,256,700 − 500,800 = 755,900 円/年
（出典: JASSO「令和6年度 学生生活調査」大学学部・昼間部・全設置者平均・居住形態別の平均生活費）
```

この 755,900 円は **住居・光熱費だけの差額ではない**。生活費（食費・住居光熱費・保健衛生費・
娯楽し好費・その他日常費＝通信費含む）の自宅外−自宅の差額であり、「住居・光熱費のみ」「下宿代のみ」
とは表現しないこと。総合版での扱いは次の方針とする（厳密な家計差額ではなく生活設計のための目安）:

- 総合版の通常生活費は「子どもが自宅通学している家庭生活」を基準前提として扱う。
- 教育費ピークシミュレーターから渡す下宿追加費用は、自宅外通学によって増える生活費の
  **参考差額**として扱う。
- 総合版では通常生活費そのものを置き換えず、**大学在学期間の教育費イベントへ追加**することを基本とする。
- この金額は一般的な目安であり、家庭の食費・仕送り・住居費・地域・生活水準によって実際の差額は異なる。

詳細は本アプリ `src/lib/educationAssumptions.ts` の `UNIVERSITY_AWAY_LIVING_EXTRA_YEN` 周辺コメントを参照。

---

## 6. 取り込みバナー

取り込み中であることと反映元を、控えめなバナー等で確認できるようにすること
（例：「教育費ピークシミュレーターの条件を取り込みました」＋取り込み解除リンク）。
赤字・警告調は使わず、総合版のトーン（落ち着いた段階表現）に合わせる。

---

## 7. 防御的な扱い（未知値・不正値）

- `lifePlanLab:education` の JSON parse は try/catch で保護し、失敗時は取り込みをスキップ。
- `version` / `assumptionVersion` が未知なら、可能な範囲で取り込み、無理なら無視（例外を投げない）。
- `juniorHighHighSchoolPlan` / `universityPlan` / `livingArrangement` が未知値のときは
  総合版の既定値へフォールバック（クラッシュさせない）。
- `currentAge` / `parentAge` / `baselineYear` は範囲チェックして clamp する。

---

## 8. 総合版側で更新が必要な許可リスト

将来、親 WordPress ページの URL から子 iframe へ教育費パラメータを渡す場合に備え、
総合版側でも以下を更新すること。

- `src/lib/embedParentParams.ts` の **`ALLOWED_PARENT_PARAMS`** に、許可する教育費系
  パラメータ（最低限 `educationSource`、将来追加分）を追加する。
- 総合版の **`docs/EMBED.md`** の許可リスト（親→子 URL パススルー）にも同じキーを追記する。
- 本アプリ側 `docs/EMBED.md` の「将来：親 URL から子 iframe へ…（許可リスト拡張方法）」と
  キー名を揃えること。

---

## 9. 完了の定義（Stage 2）

- [ ] `lifePlanLab:education` を読み、総合版の既存教育費フィールドへ反映できる
- [ ] URL `educationSource=currentPlan` を検知して取り込みを起動できる
- [ ] 優先順位（URL > localStorage > 手動編集）を満たす
- [ ] ざっくり／しっかり両診断で取り込みを維持
- [ ] 取り込みバナーを表示
- [ ] 既存教育費ロジック非破壊・下宿費用の二重計上なし
- [ ] 未知値・不正値で総合版がクラッシュしない
- [ ] `ALLOWED_PARENT_PARAMS` と総合版 `docs/EMBED.md` 許可リストを更新

上記がすべて満たされて初めて「総合版に反映済み」と言える。
