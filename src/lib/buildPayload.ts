// 確定 Payload（lifePlanLab:education）を、入力と計算結果から生成する。
// 年次明細は重複保存しない（総合版／本体で再計算可能な構造を優先）。

import { ASSUMPTION_VERSION } from './educationAssumptions';
import { STORAGE_VERSION } from './storage';
import type {
  EducationChildPayload,
  EducationPayload,
  EducationResult,
} from '../schema/types';
import type { InputState } from './inputDefaults';

export function buildEducationPayload(
  input: InputState,
  result: EducationResult,
): EducationPayload {
  const children: EducationChildPayload[] = input.children.map((c) => ({
    id: c.id,
    currentAge: c.currentAge,
    juniorHighHighSchoolPlan: c.juniorHighHighSchoolPlan,
    universityPlan: c.universityPlan,
    // 大学進学なしのときは通学形態を省く。
    ...(c.universityPlan !== 'none' && c.livingArrangement
      ? { livingArrangement: c.livingArrangement }
      : {}),
  }));

  const peak = result.peak;

  return {
    source: 'currentPlan',
    baselineYear: result.baselineYear,
    parentAge: result.parentAge,
    children,
    peakYear: peak?.year ?? result.baselineYear,
    peakYearOffset: peak?.offset ?? 0,
    peakParentAge: peak?.parentAge ?? result.parentAge,
    peakAnnualCostYen: peak?.annualCostYen ?? 0,
    totalFutureCostYen: result.totalFutureCostYen,
    assumptionVersion: ASSUMPTION_VERSION,
    savedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
  };
}
