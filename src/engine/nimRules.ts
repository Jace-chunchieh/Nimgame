/**
 * 尼姆博弈规则
 * 每回合选择一个阵列，移除任意数量（1 ~ 该阵列当前数量）
 * 无法操作（全部阵列为空）的一方判负
 */

/** 生成合法操作列表：{ 阵列下标, 可移除数量范围 } */
export function getLegalMoves(piles: number[]): { index: number; max: number }[] {
  return piles
    .map((p, index) => ({ index, max: p }))
    .filter((m) => m.max > 0)
}

/** 判断一个操作是否合法 */
export function isLegalMove(piles: number[], index: number, remove: number): boolean {
  if (index < 0 || index >= piles.length) return false
  if (remove < 1 || remove > piles[index]) return false
  return true
}

/** 执行操作，返回新堆数组（不修改原数组） */
export function applyMove(piles: number[], index: number, remove: number): number[] {
  const next = [...piles]
  next[index] = Math.max(0, next[index] - remove)
  return next
}
