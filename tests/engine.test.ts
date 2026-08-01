import { describe, expect, it } from 'vitest'
import { nimSum, toBinary, isWinningPosition } from '../src/engine/xorCalculator'
import { findOptimalMove, decideAIMove } from '../src/engine/nimAI'
import { applyMove, isLegalMove } from '../src/engine/nimRules'

describe('XOR 计算', () => {
  it('5^3 = 6', () => expect(nimSum([5, 3])).toBe(6))
  it('7^5 = 2', () => expect(nimSum([7, 5])).toBe(2))
  it('toBinary 5 = 101', () => expect(toBinary(5)).toBe('101'))
  it('toBinary 7 pad 3 = 111', () => expect(toBinary(7, 3)).toBe('111'))
  it('[7,5] 是必胜局面', () => expect(isWinningPosition([7, 5])).toBe(true))
  it('[7,7] 是必败局面', () => expect(isWinningPosition([7, 7])).toBe(false))
})

describe('必胜操作', () => {
  it('[7,5] -> 移除 2 个', () => {
    const m = findOptimalMove([7, 5])
    expect(m).not.toBeNull()
    expect(m!.pileIndex).toBe(0)
    expect(m!.remove).toBe(2)
  })
  it('[4,5,3] 操作后 XOR 归零', () => {
    const m = findOptimalMove([4, 5, 3])
    expect(m).not.toBeNull()
    const after = applyMove([4, 5, 3], m!.pileIndex, m!.remove)
    expect(after.reduce((a, b) => a ^ b, 0)).toBe(0)
  })
  it('[3,3] 无必胜操作', () => expect(findOptimalMove([3, 3])).toBeNull())
  it('单堆 [9] 全部移除', () => {
    const m = findOptimalMove([9])
    expect(m!.remove).toBe(9)
  })
})

describe('困难 AI', () => {
  it('2000 局全部合法且必胜局面必归零', () => {
    for (let i = 0; i < 2000; i++) {
      const piles = Array.from(
        { length: 3 + Math.floor(Math.random() * 3) },
        () => 1 + Math.floor(Math.random() * 15),
      )
      const mv = decideAIMove(piles, 'hard')
      expect(isLegalMove(piles, mv.pileIndex, mv.remove)).toBe(true)
      const after = applyMove(piles, mv.pileIndex, mv.remove)
      if (findOptimalMove(piles) !== null) {
        expect(after.reduce((a, b) => a ^ b, 0)).toBe(0)
      }
    }
  })
})

describe('规则边界', () => {
  it('[0,0] 无合法操作', () => expect(isLegalMove([0, 0], 0, 1)).toBe(false))
  it('越界下标非法', () => expect(isLegalMove([1], 5, 1)).toBe(false))
})
