// 入力の初期値生成。基準年は new Date().getFullYear() を既定とするが、
// テストで現在年に依存しないよう引数で注入可能にする。

import type { ChildInput, EducationDraft } from '../schema/types';
import { STORAGE_VERSION } from './storage';

let childSeq = 0;

export function createChildId(): string {
  childSeq += 1;
  return `child-${Date.now().toString(36)}-${childSeq}`;
}

export function createDefaultChild(): ChildInput {
  return {
    id: createChildId(),
    currentAge: 0,
    juniorHighHighSchoolPlan: 'public',
    universityPlan: 'nationalPublic',
    livingArrangement: 'home',
  };
}

export type InputState = {
  parentAge: number | null;
  baselineYear: number;
  children: ChildInput[];
};

export function createDefaultInput(
  baselineYear: number = new Date().getFullYear(),
): InputState {
  return {
    parentAge: null,
    baselineYear,
    children: [createDefaultChild()],
  };
}

export function inputToDraft(input: InputState): EducationDraft {
  return {
    parentAge: input.parentAge,
    baselineYear: input.baselineYear,
    children: input.children,
    savedAt: new Date().toISOString(),
    version: STORAGE_VERSION,
  };
}

export function draftToInput(draft: EducationDraft): InputState {
  return {
    parentAge: typeof draft.parentAge === 'number' ? draft.parentAge : null,
    baselineYear:
      typeof draft.baselineYear === 'number'
        ? draft.baselineYear
        : new Date().getFullYear(),
    children:
      Array.isArray(draft.children) && draft.children.length > 0
        ? draft.children.map((c) => ({
            id: typeof c.id === 'string' ? c.id : createChildId(),
            currentAge: c.currentAge,
            juniorHighHighSchoolPlan: c.juniorHighHighSchoolPlan,
            universityPlan: c.universityPlan,
            livingArrangement: c.livingArrangement,
          }))
        : [createDefaultChild()],
  };
}
