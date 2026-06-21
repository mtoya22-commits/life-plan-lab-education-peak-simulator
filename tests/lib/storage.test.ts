import { beforeEach, describe, expect, it } from 'vitest';
import {
  DRAFT_KEY,
  PAYLOAD_KEY,
  isDraftResumable,
  loadDraft,
  loadPayload,
  saveDraft,
  savePayload,
} from '../../src/lib/storage';
import { buildEducationPayload } from '../../src/lib/buildPayload';
import { runEducation } from '../../src/lib/educationEngine';
import { createDefaultInput, inputToDraft } from '../../src/lib/inputDefaults';
import type { InputState } from '../../src/lib/inputDefaults';

function sampleInput(): InputState {
  return {
    parentAge: 40,
    baselineYear: 2026,
    children: [
      {
        id: 'a',
        currentAge: 18,
        juniorHighHighSchoolPlan: 'public',
        universityPlan: 'private',
        livingArrangement: 'away',
      },
    ],
  };
}

describe('storage（下書きと確定の分離）', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('下書きキーと確定キーが別である', () => {
    expect(DRAFT_KEY).toBe('lifePlanLab:educationDraft');
    expect(PAYLOAD_KEY).toBe('lifePlanLab:education');
    expect(DRAFT_KEY).not.toBe(PAYLOAD_KEY);
  });

  it('下書き保存は確定データを更新しない（反映ボタンまで確定は不変）', () => {
    const input = sampleInput();
    saveDraft(inputToDraft(input));
    expect(loadDraft()).not.toBeNull();
    // 確定キーには何も入っていない。
    expect(loadPayload()).toBeNull();
    expect(window.localStorage.getItem(PAYLOAD_KEY)).toBeNull();
  });

  it('反映（savePayload）で初めて確定データが入る', () => {
    const input = sampleInput();
    const result = runEducation({
      parentAge: input.parentAge!,
      baselineYear: input.baselineYear,
      children: input.children,
    });
    savePayload(buildEducationPayload(input, result));
    const payload = loadPayload()!;
    expect(payload).not.toBeNull();
    // 必要項目が揃っている。
    expect(payload.source).toBe('currentPlan');
    expect(payload.baselineYear).toBe(2026);
    expect(payload.parentAge).toBe(40);
    expect(payload.children.length).toBe(1);
    expect(payload.children[0].livingArrangement).toBe('away');
    expect(typeof payload.peakYear).toBe('number');
    expect(typeof payload.peakYearOffset).toBe('number');
    expect(typeof payload.peakParentAge).toBe('number');
    expect(typeof payload.peakAnnualCostYen).toBe('number');
    expect(typeof payload.totalFutureCostYen).toBe('number');
    expect(typeof payload.assumptionVersion).toBe('string');
    expect(typeof payload.savedAt).toBe('string');
    expect(typeof payload.version).toBe('number');
  });

  it('peakParentAge = parentAge + peakYearOffset が満たされる', () => {
    const input = sampleInput();
    const result = runEducation({
      parentAge: input.parentAge!,
      baselineYear: input.baselineYear,
      children: input.children,
    });
    const payload = buildEducationPayload(input, result);
    expect(payload.peakParentAge).toBe(payload.parentAge + payload.peakYearOffset);
  });

  it('isDraftResumable は実質空の下書きで false を返す', () => {
    const empty = inputToDraft(createDefaultInput(2026)); // parentAge null, child age 0
    expect(isDraftResumable(empty)).toBe(false);

    const filled = inputToDraft(sampleInput());
    expect(isDraftResumable(filled)).toBe(true);
  });

  it('壊れた JSON でも例外を投げず null を返す', () => {
    window.localStorage.setItem(DRAFT_KEY, '{not json');
    expect(loadDraft()).toBeNull();
    window.localStorage.setItem(PAYLOAD_KEY, '{not json');
    expect(loadPayload()).toBeNull();
  });
});
