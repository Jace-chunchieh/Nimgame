/**
 * 二进制异或计算工具
 * 尼姆和 = A1 XOR A2 XOR ... XOR An
 */

/** 计算整局尼姆和 */
export function nimSum(piles: number[]): number {
  return piles.reduce((acc, p) => acc ^ p, 0)
}

/** 计算指定索引堆被修改为 value 后的尼姆和 */
export function nimSumAfterChange(
  piles: number[],
  index: number,
  value: number,
): number {
  const base = nimSum(piles)
  return base ^ piles[index] ^ value
}

/** 数字转定长二进制字符串，如 5 -> "101" */
export function toBinary(n: number, bits = 3): string {
  return n.toString(2).padStart(bits, '0')
}

/** 计算表示数组最大值所需的二进制位数（至少 3 位） */
export function bitWidth(piles: number[]): number {
  const max = Math.max(...piles, 0)
  return Math.max(3, max.toString(2).length)
}

/** 判断是否为必胜局面（尼姆和 != 0 即存在必胜操作） */
export function isWinningPosition(piles: number[]): boolean {
  return nimSum(piles) !== 0
}

/** 局面是否结束（所有阵列耗尽） */
export function isGameOver(piles: number[]): boolean {
  return piles.every((p) => p === 0)
}
