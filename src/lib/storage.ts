// localStorage の読み書き。下書きと確定データを「分離」して扱う。
// - lifePlanLab:educationDraft … 入力途中の下書き（デバウンス保存）
// - lifePlanLab:education       … 総合版へ渡す確定データ（反映ボタン時のみ更新）
//
// すべて防御的に parse し、未知・不正値で例外を投げない。

import type { EducationDraft, EducationPayload } from '../schema/types';

export const DRAFT_KEY = 'lifePlanLab:educationDraft';
export const PAYLOAD_KEY = 'lifePlanLab:education';

export const STORAGE_VERSION = 1;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* localStorage 不可（プライベートモード等）でも落とさない */
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

// ---- 下書き ----

export function saveDraft(draft: EducationDraft): void {
  safeSet(DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): EducationDraft | null {
  const raw = safeGet(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.children)) return null;
    return parsed as EducationDraft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  safeRemove(DRAFT_KEY);
}

// 下書きが「実質的に空」でないか（再開カードを出してよいか）を判定する。
// 親年齢が入っている、または子どもに年齢が入力されていれば「再開する価値あり」。
export function isDraftResumable(draft: EducationDraft | null): boolean {
  if (!draft) return false;
  if (typeof draft.parentAge === 'number') return true;
  return draft.children.some(
    (c) => typeof c.currentAge === 'number' && c.currentAge > 0,
  );
}

// ---- 確定データ（総合版へ渡す） ----

export function savePayload(payload: EducationPayload): void {
  safeSet(PAYLOAD_KEY, JSON.stringify(payload));
}

export function loadPayload(): EducationPayload | null {
  const raw = safeGet(PAYLOAD_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as EducationPayload;
  } catch {
    return null;
  }
}
