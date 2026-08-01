import type { Difficulty } from '../types'
import { getLegalMoves } from './nimRules'
import { nimSum } from './xorCalculator'

export interface AIMove {
  pileIndex: number
  remove: number
}

/**
 * 尼姆 AI
 * 困难模式：完全采用必胜算法（NimSum 归零）
 * 普通模式：70% 最优 + 30% 随机
 * 简单模式：20% 最优 + 80% 随机
 */
export function decideAIMove(piles: number[], difficulty: Difficulty): AIMove {
  const optimal = findOptimalMove(piles)

  switch (difficulty) {
    case 'hard':
      if (optimal) return optimal
      return randomMove(piles)
    case 'normal':
      if (optimal && Math.random() < 0.7) return optimal
      return randomMove(piles)
    case 'easy':
      if (optimal && Math.random() < 0.2) return optimal
      return randomMove(piles)
  }
}

/**
 * 寻找必胜操作（使 NimSum = 0）：
 * NimSum != 0 时，找 target = pile XOR NimSum 且 target < pile 的堆
 */
export function findOptimalMove(piles: number[]): AIMove | null {
  const sum = nimSum(piles)
  if (sum === 0) return null

  for (let i = 0; i < piles.length; i++) {
    const pile = piles[i]
    if (pile === 0) continue
    const target = pile ^ sum
    if (target < pile) {
      return { pileIndex: i, remove: pile - target }
    }
  }
  return null
}

/** 随机合法操作 */
function randomMove(piles: number[]): AIMove {
  const legal = getLegalMoves(piles)
  const pick = legal[Math.floor(Math.random() * legal.length)]
  const remove = 1 + Math.floor(Math.random() * pick.max)
  return { pileIndex: pick.index, remove }
}

/**
 * 给出当前局面的人类最优建议（用于失败复盘与闯关提示）
 */
export function getSuggestion(piles: number[]): string {
  const optimal = findOptimalMove(piles)
  if (!optimal) {
    return '当前为稳定局面（XOR = 0），尽量制造对手被迫破坏稳定的局面。'
  }
  const before = piles[optimal.pileIndex]
  const after = before - optimal.remove
  return `建议操作：阵列 ${String.fromCharCode(65 + optimal.pileIndex)} 移除 ${optimal.remove} 个核心（${before} → ${after}），使 XOR 归零。`
}
