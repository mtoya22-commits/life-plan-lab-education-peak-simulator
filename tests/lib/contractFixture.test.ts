import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildEducationPayload } from '../../src/lib/buildPayload';
import { runEducation } from '../../src/lib/educationEngine';
import type { EducationInput } from '../../src/schema/types';

// 送受信契約フィクスチャの送信側テスト。
// tests/fixtures/educationPayload.v1.json は、総合版リポの
// tests/fixtures/contracts/educationPayload.v1.json と**バイト単位で同一**の契約ファイル。
// このテストは「本アプリが実際に保存する payload がフィクスチャと完全一致する」ことを固定し、
// 総合版側は同じフィクスチャを「読める」ことをテストする。
// フィクスチャを変更するときは、送信側（本テスト）・受信側（総合版の parse テスト）・
// 両リポのフィクスチャを同じ変更単位で更新すること。

const FIXTURE_PATH = resolve(process.cwd(), 'tests/fixtures/educationPayload.v1.json');
const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'));

describe('educationPayload.v1 契約フィクスチャ（送信側）', () => {
  beforeEach(() => {
    // savedAt はフィクスチャの固定時刻に合わせる。
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-07T00:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('buildEducationPayload の実出力がフィクスチャと完全一致する', () => {
    const input: EducationInput = {
      parentAge: 40,
      baselineYear: 2026,
      children: [
        {
          id: 'child-1',
          currentAge: 8,
          juniorHighHighSchoolPlan: 'privateIntegrated',
          universityPlan: 'private',
          livingArrangement: 'away',
        },
        {
          id: 'child-2',
          currentAge: 5,
          juniorHighHighSchoolPlan: 'public',
          universityPlan: 'nationalPublic',
          livingArrangement: 'home',
        },
      ],
    };
    const result = runEducation(input);
    const payload = buildEducationPayload(input, result);

    expect(payload).toEqual(fixture);
    // JSON 化しても同一（キーの欠落・余剰・型のずれがない）。
    expect(JSON.parse(JSON.stringify(payload))).toEqual(fixture);
  });

  it('フィクスチャは総合版が依存する必須フィールドをすべて持つ', () => {
    expect(fixture.source).toBe('currentPlan');
    expect(fixture.version).toBe(1);
    expect(Array.isArray(fixture.children)).toBe(true);
    for (const c of fixture.children) {
      expect(typeof c.currentAge).toBe('number');
      expect(typeof c.juniorHighHighSchoolPlan).toBe('string');
      expect(typeof c.universityPlan).toBe('string');
    }
    expect(typeof fixture.savedAt).toBe('string');
    expect(typeof fixture.assumptionVersion).toBe('string');
  });
});
