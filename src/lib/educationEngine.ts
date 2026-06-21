// 教育費の計算（純粋関数）。UI / ストア / localStorage に一切依存しない。
// baselineYear は引数で注入され、現在年に依存しない（テスト容易性のため）。

import {
  AGE,
  ANNUAL_LEARNING_COST_YEN,
  NATIONAL_UNIVERSITY_YEN,
  PRIVATE_UNIVERSITY_YEN,
  UNIVERSITY_AWAY_LIVING_EXTRA_YEN,
  CHILD_AGE_MIN,
  CHILD_AGE_MAX,
  PARENT_AGE_MIN,
  PARENT_AGE_MAX,
} from './educationAssumptions';
import type {
  ChildInput,
  ChildResult,
  ChildYearCost,
  EducationInput,
  EducationResult,
  EducationStage,
  FamilyYearCost,
  JuniorHighHighSchoolPlan,
  OverlapPeriod,
  UniversityPlan,
} from '../schema/types';

const JHHS_PLANS: JuniorHighHighSchoolPlan[] = [
  'public',
  'publicToPrivateHigh',
  'privateIntegrated',
];
const UNIVERSITY_PLANS: UniversityPlan[] = ['none', 'nationalPublic', 'private'];

// 不正値に対する防御的な正規化。クラッシュさせず妥当な既定へ寄せる。
function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? Math.round(value) : Number(value);
  if (!Number.isFinite(n)) return fallback;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function normalizeJhhs(value: unknown): JuniorHighHighSchoolPlan {
  return JHHS_PLANS.includes(value as JuniorHighHighSchoolPlan)
    ? (value as JuniorHighHighSchoolPlan)
    : 'public';
}

function normalizeUniversity(value: unknown): UniversityPlan {
  return UNIVERSITY_PLANS.includes(value as UniversityPlan)
    ? (value as UniversityPlan)
    : 'none';
}

// ある年齢のときの、中高方針に応じた中学／高校の段階を返す。
function jhhsStageForAge(
  age: number,
  plan: JuniorHighHighSchoolPlan,
): EducationStage {
  const inJuniorHigh = age >= AGE.juniorHighStart && age <= AGE.juniorHighEnd;
  const inHighSchool = age >= AGE.highSchoolStart && age <= AGE.highSchoolEnd;
  if (inJuniorHigh) {
    // 私立中高一貫は計算上、中学期間は私立中学校の年額を用いる。
    return plan === 'privateIntegrated' ? 'juniorHighPrivate' : 'juniorHigh';
  }
  if (inHighSchool) {
    if (plan === 'public') return 'highSchool';
    // publicToPrivateHigh / privateIntegrated はどちらも高校期間は私立高校。
    return 'highSchoolPrivate';
  }
  return 'none';
}

// 教育段階ごとの年額（一時費用・下宿追加を除く基本年額）。
function baseAnnualCost(stage: EducationStage): number {
  switch (stage) {
    case 'elementary':
      return ANNUAL_LEARNING_COST_YEN.publicElementary;
    case 'juniorHigh':
      return ANNUAL_LEARNING_COST_YEN.publicJuniorHigh;
    case 'juniorHighPrivate':
      return ANNUAL_LEARNING_COST_YEN.privateJuniorHigh;
    case 'highSchool':
      return ANNUAL_LEARNING_COST_YEN.publicHighSchool;
    case 'highSchoolPrivate':
      return ANNUAL_LEARNING_COST_YEN.privateHighSchool;
    case 'universityNational':
      // 2〜4年目総額。入学年は firstYearTotalYen で上書きする（buildChildYearly 参照）。
      return NATIONAL_UNIVERSITY_YEN.subsequentYearTotalYen;
    case 'universityPrivate':
      // 2〜4年目総額。入学年は firstYearTotalYen で上書きする（buildChildYearly 参照）。
      return PRIVATE_UNIVERSITY_YEN.subsequentYearTotalYen;
    case 'none':
    default:
      return 0;
  }
}

// 1 人の子どもについて、現在年齢から大学卒業想定までの年次費用を構築する。
function buildChildYearly(
  child: ChildInput,
  baselineYear: number,
): ChildYearCost[] {
  const currentAge = clampInt(child.currentAge, CHILD_AGE_MIN, CHILD_AGE_MAX, 0);
  const jhhs = normalizeJhhs(child.juniorHighHighSchoolPlan);
  const university = normalizeUniversity(child.universityPlan);
  const away = child.livingArrangement === 'away' && university !== 'none';

  const rows: ChildYearCost[] = [];
  // 現在年齢より前は計算しない。大学卒業想定年齢（universityEnd）まで。
  for (let age = currentAge; age <= AGE.universityEnd; age++) {
    const offset = age - currentAge;
    const year = baselineYear + offset;
    let stage: EducationStage = 'none';
    let cost = 0;

    if (age >= AGE.elementaryStart && age <= AGE.elementaryEnd) {
      stage = 'elementary';
      cost = baseAnnualCost(stage);
    } else if (age >= AGE.juniorHighStart && age <= AGE.highSchoolEnd) {
      stage = jhhsStageForAge(age, jhhs);
      cost = baseAnnualCost(stage);
    } else if (
      university !== 'none' &&
      age >= AGE.universityStart &&
      age <= AGE.universityEnd
    ) {
      stage = university === 'private' ? 'universityPrivate' : 'universityNational';
      // 入学年(18歳)は firstYearTotalYen（入学料等を内包）。2〜4年目は subsequentYearTotalYen。
      // 入学時費用は初年度総額に内包済みのため、別途上乗せしない。
      if (age === AGE.universityStart) {
        cost =
          university === 'private'
            ? PRIVATE_UNIVERSITY_YEN.firstYearTotalYen
            : NATIONAL_UNIVERSITY_YEN.firstYearTotalYen;
      } else {
        cost = baseAnnualCost(stage);
      }
      // 下宿・一人暮らしのときのみ、自宅外通学による追加生活費を在学中の各年に上乗せ。
      if (away) {
        cost += UNIVERSITY_AWAY_LIVING_EXTRA_YEN.annualExtraYen;
      }
    }

    rows.push({ year, age, stage, costYen: cost });
  }
  return rows;
}

function summarizeChild(
  child: ChildInput,
  yearly: ChildYearCost[],
  parentAge: number,
  baselineYear: number,
): ChildResult {
  const withCost = yearly.filter((r) => r.costYen > 0);
  const total = withCost.reduce((sum, r) => sum + r.costYen, 0);

  let peak: ChildResult['peak'] = null;
  for (const r of withCost) {
    if (peak === null || r.costYen > peak.annualCostYen) {
      peak = {
        year: r.year,
        parentAge: parentAge + (r.year - baselineYear),
        annualCostYen: r.costYen,
        stage: r.stage,
      };
    }
    // 同額なら最も早い年を維持（> 比較なので自然に最早が残る）。
  }

  return {
    id: child.id,
    yearly,
    totalFutureCostYen: total,
    peak,
  };
}

// 教育費ゼロ期間をグラフに長く表示しないため、費用発生のある年範囲にトリムする。
function trimFamilyRange(family: FamilyYearCost[]): FamilyYearCost[] {
  const first = family.findIndex((f) => f.totalYen > 0);
  if (first === -1) return [];
  let last = family.length - 1;
  while (last > first && family[last].totalYen === 0) last--;
  return family.slice(first, last + 1);
}

// 複数子のとき、2 人以上が同時に費用を負担し、かつ家族費用が高い連続区間を返す。
function findOverlap(
  family: FamilyYearCost[],
  childCount: number,
): OverlapPeriod | null {
  if (childCount < 2) return null;

  // 2 人以上が同時に費用発生している年を抽出。
  const multi = family.filter(
    (f) => f.byChild.filter((c) => c.costYen > 0).length >= 2,
  );
  if (multi.length === 0) return null;

  // それらの年のうち、家族費用が高い年（最大の 70% 以上）を「重なりやすい時期」とする。
  const maxAmong = Math.max(...multi.map((f) => f.totalYen));
  const threshold = maxAmong * 0.7;
  const heavy = multi.filter((f) => f.totalYen >= threshold);
  if (heavy.length === 0) return null;

  // 最も負担が重い年を含む連続区間（multi の中で連続する年）を返す。
  const peakYear = heavy.reduce((a, b) => (b.totalYen > a.totalYen ? b : a)).year;
  const multiYears = new Set(multi.map((f) => f.year));
  let startYear = peakYear;
  let endYear = peakYear;
  while (multiYears.has(startYear - 1)) startYear--;
  while (multiYears.has(endYear + 1)) endYear++;

  return { startYear, endYear };
}

export function runEducation(input: EducationInput): EducationResult {
  const baselineYear = clampInt(
    input?.baselineYear,
    1900,
    3000,
    new Date().getFullYear(),
  );
  const parentAge = clampInt(
    input?.parentAge,
    PARENT_AGE_MIN,
    PARENT_AGE_MAX,
    PARENT_AGE_MIN,
  );
  const children = Array.isArray(input?.children) ? input.children : [];

  const childResults: ChildResult[] = children.map((child) => {
    const yearly = buildChildYearly(child, baselineYear);
    return summarizeChild(child, yearly, parentAge, baselineYear);
  });

  // 家族全体の年次合算（子ども別内訳を保持）。
  const yearMap = new Map<number, FamilyYearCost>();
  for (const cr of childResults) {
    for (const row of cr.yearly) {
      let entry = yearMap.get(row.year);
      if (!entry) {
        entry = {
          year: row.year,
          offset: row.year - baselineYear,
          parentAge: parentAge + (row.year - baselineYear),
          totalYen: 0,
          byChild: [],
        };
        yearMap.set(row.year, entry);
      }
      entry.totalYen += row.costYen;
      entry.byChild.push({ id: cr.id, costYen: row.costYen });
    }
  }

  const familyAll = [...yearMap.values()].sort((a, b) => a.year - b.year);
  const family = trimFamilyRange(familyAll);

  const totalFutureCostYen = childResults.reduce(
    (sum, c) => sum + c.totalFutureCostYen,
    0,
  );

  // ピーク年：家族年間費用が最大の年。同額が複数なら最も早い年。
  let peak: EducationResult['peak'] = null;
  for (const f of family) {
    if (f.totalYen <= 0) continue;
    if (peak === null || f.totalYen > peak.annualCostYen) {
      peak = {
        year: f.year,
        offset: f.offset,
        parentAge: f.parentAge,
        annualCostYen: f.totalYen,
      };
    }
  }

  const overlap = findOverlap(family, childResults.length);

  return {
    baselineYear,
    parentAge,
    children: childResults,
    family,
    totalFutureCostYen,
    peak,
    overlap,
  };
}
