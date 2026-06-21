import { describe, expect, it } from 'vitest';
import {
  EDUCATION_SOURCE_PARAM,
  MAIN_SIMULATOR_URL,
  buildMainSimulatorUrl,
} from '../../src/lib/handoffUrl';

describe('handoffUrl（総合版リンク）', () => {
  it('本番URLを向く（example.com を含まない）', () => {
    expect(MAIN_SIMULATOR_URL).toBe(
      'https://fire-lifeplan-lab.com/life-plan-simulator/',
    );
    expect(MAIN_SIMULATOR_URL).not.toContain('example.com');
  });

  it('educationSource=currentPlan を付与する', () => {
    const url = buildMainSimulatorUrl('currentPlan');
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      'https://fire-lifeplan-lab.com/life-plan-simulator/',
    );
    expect(parsed.searchParams.get(EDUCATION_SOURCE_PARAM)).toBe('currentPlan');
    expect(url).not.toContain('example.com');
  });
});
