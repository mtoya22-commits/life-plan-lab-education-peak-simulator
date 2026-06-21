// 数値整形ユーティリティ。表示時のみ使用（内部は常に円・整数）。

const yenFormatter = new Intl.NumberFormat('ja-JP');

// カンマ区切りの円。例: 1234567 -> "1,234,567"
export function formatYen(value: number): string {
  return yenFormatter.format(Math.round(value));
}

// 「約◯万円」表記（万円単位で四捨五入）。読み上げでも意味が通るよう「約」を付ける。
export function formatManYen(value: number): string {
  const man = Math.round(value / 10_000);
  return `約${yenFormatter.format(man)}万円`;
}

// 「◯歳ごろ」表記。
export function formatParentAgeApprox(age: number): string {
  return `${age}歳ごろ`;
}
