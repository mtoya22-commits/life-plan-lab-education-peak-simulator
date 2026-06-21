// 総合版（生活設計シミュレーター）への遷移 URL を構築する独立関数。
// 将来、総合版側で受け取り仕様を追加した際に備え、URL 構築をここに隔離する。
// プレースホルダのダミードメインは使わず、本番 URL のみを向く。

import type { EducationSource } from '../schema/types';

// 総合版の本番 URL（フォールバックも含めダミードメインは使用しない）。
export const MAIN_SIMULATOR_URL =
  'https://fire-lifeplan-lab.com/life-plan-simulator/';

// 総合版へ渡す補助情報のキー。
export const EDUCATION_SOURCE_PARAM = 'educationSource';

// 確定済みデータの引き継ぎ元を URL パラメータとして付与する。
// 現状は educationSource=currentPlan のみ。将来項目が増えてもここで拡張する。
export function buildMainSimulatorUrl(
  source: EducationSource = 'currentPlan',
): string {
  const url = new URL(MAIN_SIMULATOR_URL);
  url.searchParams.set(EDUCATION_SOURCE_PARAM, source);
  return url.toString();
}
