// 型・入力スキーマ・引き継ぎ Payload の定義。
// 単一ソースとして UI / engine / storage / handoff が参照する。

export type JuniorHighHighSchoolPlan =
  | 'public' // 公立中心（公立中学校 → 公立高校）
  | 'publicToPrivateHigh' // 公立中学校 → 私立高校
  | 'privateIntegrated'; // 私立中高一貫（計算上は私立中学校＋私立高校）

export type UniversityPlan =
  | 'none' // 進学しない
  | 'nationalPublic' // 国公立大学
  | 'private'; // 私立大学

export type LivingArrangement = 'home' | 'away'; // 自宅通学 / 下宿・一人暮らし

// 引き継ぎ Payload（lifePlanLab:education）。総合版へ渡す確定データの子要素。
export type EducationChildPayload = {
  id: string;
  currentAge: number;
  juniorHighHighSchoolPlan: JuniorHighHighSchoolPlan;
  universityPlan: UniversityPlan;
  livingArrangement?: LivingArrangement;
};

// アプリ内部で扱う子ども入力（UI 状態）。Payload と同形だが将来の拡張に備え分離。
export type ChildInput = EducationChildPayload;

export type EducationInput = {
  parentAge: number;
  baselineYear: number;
  children: ChildInput[];
};

export type EducationSource = 'currentPlan';

// 総合版へ渡す確定 Payload（localStorage: lifePlanLab:education）。
// 年次明細は重複保存しない（総合版／本体で再計算可能な構造を優先）。
export type EducationPayload = {
  source: EducationSource;
  baselineYear: number;
  parentAge: number;
  children: EducationChildPayload[];
  peakYear: number;
  peakYearOffset: number;
  peakParentAge: number;
  peakAnnualCostYen: number;
  totalFutureCostYen: number;
  assumptionVersion: string;
  savedAt: string;
  version: number;
};

// 下書き（localStorage: lifePlanLab:educationDraft）。入力途中の保存。
export type EducationDraft = {
  parentAge: number | null;
  baselineYear: number;
  children: ChildInput[];
  savedAt: string;
  version: number;
};

// ===== 計算結果 =====

// 教育段階（年次の主費目ラベル）。
export type EducationStage =
  | 'none'
  | 'elementary'
  | 'juniorHigh'
  | 'juniorHighPrivate'
  | 'highSchool'
  | 'highSchoolPrivate'
  | 'universityNational'
  | 'universityPrivate';

// 1 人の子どもの 1 年分。
export type ChildYearCost = {
  year: number;
  age: number;
  stage: EducationStage;
  costYen: number; // 年額の合計（学費＋自宅外通学による追加生活費を含む）
  // costYen のうち「自宅外通学による追加生活費」分（自宅通学・非大学年は 0）。
  // 内訳集計で「大学の納付金」と「自宅外通学による追加生活費」を分離するために保持する。
  awayExtraYen: number;
};

export type ChildResult = {
  id: string;
  yearly: ChildYearCost[];
  totalFutureCostYen: number;
  peak: {
    year: number;
    parentAge: number;
    annualCostYen: number;
    stage: EducationStage;
  } | null;
};

// 家族全体の 1 年分（子ども別内訳を持つ＝積み上げ棒グラフ用）。
export type FamilyYearCost = {
  year: number;
  offset: number; // baselineYear からの経過年
  parentAge: number;
  totalYen: number;
  byChild: { id: string; costYen: number }[];
};

export type OverlapPeriod = {
  startYear: number;
  endYear: number;
};

// 教育関連費の構成内訳。年次計算結果からの純粋集計で、
// k12Yen + universityYen + awayExtraYen === totalFutureCostYen が常に成立する。
export type EducationBreakdown = {
  k12Yen: number; // 小学校〜高校の学習費
  universityYen: number; // 大学の納付金（自宅外通学の追加生活費を除く）
  awayExtraYen: number; // 自宅外通学による追加生活費
};

export type EducationResult = {
  baselineYear: number;
  parentAge: number;
  children: ChildResult[];
  family: FamilyYearCost[];
  totalFutureCostYen: number;
  breakdown: EducationBreakdown;
  peak: {
    year: number;
    offset: number;
    parentAge: number;
    annualCostYen: number;
  } | null;
  overlap: OverlapPeriod | null; // 複数子のとき、費用が重なりやすい時期
};
