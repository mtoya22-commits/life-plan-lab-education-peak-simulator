import { describe, expect, it } from 'vitest';
import { runEducation } from '../../src/lib/educationEngine';
import {
  ANNUAL_LEARNING_COST_YEN,
  NATIONAL_UNIVERSITY_YEN,
  PRIVATE_UNIVERSITY_YEN,
  UNIVERSITY_AWAY_EXTRA_YEN,
  AGE,
} from '../../src/lib/educationAssumptions';
import type { ChildInput, EducationInput } from '../../src/schema/types';

const BASE = 2026;

function child(partial: Partial<ChildInput>): ChildInput {
  return {
    id: partial.id ?? 'c1',
    currentAge: partial.currentAge ?? 0,
    juniorHighHighSchoolPlan: partial.juniorHighHighSchoolPlan ?? 'public',
    universityPlan: partial.universityPlan ?? 'none',
    livingArrangement: partial.livingArrangement,
  };
}

function input(children: ChildInput[], parentAge = 40): EducationInput {
  return { parentAge, baselineYear: BASE, children };
}

describe('runEducation', () => {
  it('子1人・公立中心・大学進学なし：公立小中高のみ計上、大学費用なし', () => {
    const r = runEducation(
      input([child({ currentAge: 6, juniorHighHighSchoolPlan: 'public', universityPlan: 'none' })]),
    );
    const c = r.children[0];
    // 6歳から計算。小6年 + 中3年 + 高3年。
    const expected =
      ANNUAL_LEARNING_COST_YEN.publicElementary * 6 +
      ANNUAL_LEARNING_COST_YEN.publicJuniorHigh * 3 +
      ANNUAL_LEARNING_COST_YEN.publicHighSchool * 3;
    expect(c.totalFutureCostYen).toBe(expected);
    // 大学費用が一切ない。
    expect(c.yearly.some((y) => y.stage.startsWith('university'))).toBe(false);
  });

  it('子1人・国公立大学・自宅通学：入学年に入学料が加算される', () => {
    const r = runEducation(
      input([child({ currentAge: 18, universityPlan: 'nationalPublic', livingArrangement: 'home' })]),
    );
    const c = r.children[0];
    const firstYear = c.yearly.find((y) => y.age === AGE.universityStart)!;
    expect(firstYear.costYen).toBe(
      NATIONAL_UNIVERSITY_YEN.annualTuition + NATIONAL_UNIVERSITY_YEN.admissionFee,
    );
    // 4年分の授業料 + 入学料。
    const expectedTotal =
      NATIONAL_UNIVERSITY_YEN.annualTuition * 4 + NATIONAL_UNIVERSITY_YEN.admissionFee;
    expect(c.totalFutureCostYen).toBe(expectedTotal);
  });

  it('子1人・私立大学・下宿：初年度納付金と下宿追加が反映される', () => {
    const r = runEducation(
      input([child({ currentAge: 18, universityPlan: 'private', livingArrangement: 'away' })]),
    );
    const c = r.children[0];
    const firstYear = c.yearly.find((y) => y.age === AGE.universityStart)!;
    expect(firstYear.costYen).toBe(
      PRIVATE_UNIVERSITY_YEN.firstYearTotal +
        UNIVERSITY_AWAY_EXTRA_YEN.annualHousingUtilities,
    );
    const secondYear = c.yearly.find((y) => y.age === AGE.universityStart + 1)!;
    expect(secondYear.costYen).toBe(
      PRIVATE_UNIVERSITY_YEN.subsequentYearTotal +
        UNIVERSITY_AWAY_EXTRA_YEN.annualHousingUtilities,
    );
  });

  it('私立中高一貫：中学期間は私立中学、高校期間は私立高校が対象年齢にのみ反映される', () => {
    const r = runEducation(
      input([child({ currentAge: 12, juniorHighHighSchoolPlan: 'privateIntegrated', universityPlan: 'none' })]),
    );
    const c = r.children[0];
    const jh = c.yearly.find((y) => y.age === 13)!;
    const hs = c.yearly.find((y) => y.age === 16)!;
    expect(jh.stage).toBe('juniorHighPrivate');
    expect(jh.costYen).toBe(ANNUAL_LEARNING_COST_YEN.privateJuniorHigh);
    expect(hs.stage).toBe('highSchoolPrivate');
    expect(hs.costYen).toBe(ANNUAL_LEARNING_COST_YEN.privateHighSchool);
  });

  it('現在年齢より前の教育費は計算しない', () => {
    const r = runEducation(
      input([child({ currentAge: 16, juniorHighHighSchoolPlan: 'public', universityPlan: 'none' })]),
    );
    const c = r.children[0];
    // 16歳開始なので 6〜15歳（小・中・高1年目）は含まれない。
    expect(c.yearly.every((y) => y.age >= 16)).toBe(true);
    expect(c.yearly.some((y) => y.stage === 'elementary')).toBe(false);
    expect(c.yearly.some((y) => y.stage === 'juniorHigh')).toBe(false);
  });

  it('子2人の教育費が同じ年に合算される', () => {
    // 第1子18歳(私立大), 第2子16歳(公立高)。BASE年は両方在学。
    const r = runEducation(
      input([
        child({ id: 'a', currentAge: 18, universityPlan: 'private', livingArrangement: 'home' }),
        child({ id: 'b', currentAge: 16, juniorHighHighSchoolPlan: 'public', universityPlan: 'none' }),
      ]),
    );
    const baseYearRow = r.family.find((f) => f.year === BASE)!;
    expect(baseYearRow.byChild.filter((c) => c.costYen > 0).length).toBe(2);
    expect(baseYearRow.totalYen).toBe(
      PRIVATE_UNIVERSITY_YEN.firstYearTotal + ANNUAL_LEARNING_COST_YEN.publicHighSchool,
    );
  });

  it('ピーク年が正しく選ばれる（最大の家族年間費用の年）', () => {
    const r = runEducation(
      input([
        child({ id: 'a', currentAge: 18, universityPlan: 'private', livingArrangement: 'home' }),
        child({ id: 'b', currentAge: 16, universityPlan: 'private', livingArrangement: 'home' }),
      ]),
    );
    // 第2子が18歳になる年（BASE+2）に両方私立大初年度級が重なる可能性。
    const peak = r.peak!;
    const maxFamily = Math.max(...r.family.map((f) => f.totalYen));
    expect(peak.annualCostYen).toBe(maxFamily);
  });

  it('ピーク額が同額の年が複数ある場合、最も早い年を返す', () => {
    // 子1人・私立大・自宅：2〜4年目は同額。初年度は一時費用で最大。
    // 同額を作るため、大学なしの公立小（同額が6年続く）でピーク検証。
    const r = runEducation(
      input([child({ currentAge: 6, juniorHighHighSchoolPlan: 'public', universityPlan: 'none' })]),
    );
    // 公立小(6年)・公立中(3年)・公立高(3年)のうち最大単年は公立高。
    // 公立高は3年連続同額 → 最も早い年(15歳の年)が選ばれる。
    const peak = r.peak!;
    const highSchoolStartYear = BASE + (AGE.highSchoolStart - 6);
    expect(peak.year).toBe(highSchoolStartYear);
  });

  it('親年齢が parentAge + peakYearOffset で正しく計算される', () => {
    const parentAge = 45;
    const r = runEducation(
      input([child({ currentAge: 18, universityPlan: 'private', livingArrangement: 'home' })], parentAge),
    );
    const peak = r.peak!;
    expect(peak.parentAge).toBe(parentAge + peak.offset);
  });

  it('大学進学なしの場合、大学費用が発生しない', () => {
    const r = runEducation(
      input([child({ currentAge: 17, universityPlan: 'none' })]),
    );
    const c = r.children[0];
    expect(c.yearly.some((y) => y.stage.startsWith('university'))).toBe(false);
  });

  it('不正な年齢・進路値でクラッシュしない', () => {
    const bad = {
      parentAge: 999,
      baselineYear: NaN,
      children: [
        { id: 'x', currentAge: -5, juniorHighHighSchoolPlan: 'bogus', universityPlan: 'weird', livingArrangement: 'moon' },
        { id: 'y', currentAge: 'abc' },
      ],
    };
    expect(() => runEducation(bad as unknown as EducationInput)).not.toThrow();
    const r = runEducation(bad as unknown as EducationInput);
    expect(Array.isArray(r.family)).toBe(true);
  });

  it('複数子のとき重なりやすい時期が算出される（単数子では null）', () => {
    const single = runEducation(input([child({ currentAge: 18, universityPlan: 'private' })]));
    expect(single.overlap).toBeNull();

    const twins = runEducation(
      input([
        child({ id: 'a', currentAge: 17, universityPlan: 'private', livingArrangement: 'home' }),
        child({ id: 'b', currentAge: 15, universityPlan: 'private', livingArrangement: 'home' }),
      ]),
    );
    expect(twins.overlap).not.toBeNull();
    expect(twins.overlap!.endYear).toBeGreaterThanOrEqual(twins.overlap!.startYear);
  });
});
