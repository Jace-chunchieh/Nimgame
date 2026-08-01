import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useGameStore } from '../src/store/gameStore'
import { useChallengeStore } from '../src/store/challengeStore'

describe('gameStore 状态机', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('玩家先手开局直接进入 player-turn', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: true })
    expect(game.state.status).toBe('player-turn')
    expect(game.state.currentPlayer).toBe('human')
    expect(game.state.piles.length).toBeGreaterThan(0)
  })

  it('AI 先手开局进入 ai-thinking 且可执行 aiMove', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: false })
    expect(game.state.status).toBe('ai-thinking')
    const move = game.aiMove()
    expect(move).not.toBeNull()
    expect(game.state.status).toBe('player-turn')
  })

  it('pvp 开局 p1 回合且玩家操作后切换到 p2', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'pvp', piles: [3, 3] })
    expect(game.state.currentPlayer).toBe('p1')
    expect(game.state.status).toBe('player-turn')
    const ok = game.playerMove(0, 1)
    expect(ok).toBe(true)
    expect(game.state.currentPlayer).toBe('p2')
    expect(game.state.status).toBe('player-turn')
    expect(game.state.history.length).toBe(1)
  })

  it('人机回合流转：玩家操作后进入 ai-thinking，aiMove 后回到 player-turn', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: true, piles: [4, 3] })
    expect(game.playerMove(0, 2)).toBe(true)
    expect(game.state.status).toBe('ai-thinking')
    expect(game.state.currentPlayer).toBe('ai')
    const mv = game.aiMove()
    expect(mv).not.toBeNull()
    expect(game.state.status).toBe('player-turn')
    expect(game.state.currentPlayer).toBe('human')
  })

  it('单堆终局：移除最后一颗后判胜', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: true, piles: [2] })
    game.playerMove(0, 2)
    expect(game.state.status).toBe('game-over')
    expect(game.state.winner).toBe('human')
    expect(game.lastStats).not.toBeNull()
    expect(game.lastStats!.durationMs).toBeGreaterThanOrEqual(0)
  })

  it('悔棋：玩家操作+AI响应后，撤销恢复玩家回合初始局面', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: true, piles: [5, 4] })
    const before = [...game.state.piles]
    game.playerMove(0, 3)
    game.aiMove()
    expect(game.state.history.length).toBe(2)
    const ok = game.undoLastMove()
    expect(ok).toBe(true)
    expect(game.state.history.length).toBe(0)
    expect(game.state.piles).toEqual(before)
    expect(game.state.status).toBe('player-turn')
    expect(game.state.currentPlayer).toBe('human')
  })

  it('pvp 不支持悔棋', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'pvp', piles: [3, 3] })
    game.playerMove(0, 1)
    expect(game.undoLastMove()).toBe(false)
  })

  it('提示：限次且返回最优操作', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: true, piles: [7, 5] })
    const hint = game.useHint()
    expect(hint).not.toBeNull()
    expect(hint!.remove).toBe(2)
    expect(game.state.hintUsed).toBe(1)
    // 用满 3 次后返回 null
    game.useHint()
    game.useHint()
    expect(game.useHint()).toBeNull()
  })

  it('非玩家回合不可操作', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: false, piles: [3, 3] })
    expect(game.playerMove(0, 1)).toBe(false)
  })

  it('非法操作被拒绝', () => {
    const game = useGameStore()
    game.newGame({ gameMode: 'quick', humanFirst: true, piles: [2, 2] })
    expect(game.playerMove(0, 5)).toBe(false)
    expect(game.playerMove(9, 1)).toBe(false)
  })
})

describe('挑战进度（含旧数据迁移）', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('旧版数字格式进度可迁移', () => {
    localStorage.setItem('xor-nim:progress', '3')
    const ch = useChallengeStore()
    expect(ch.isUnlocked(3)).toBe(true)
    expect(ch.isUnlocked(4)).toBe(false)
    expect(ch.starsOf(1)).toBe(0)
  })

  it('通关解锁下一关并记录星级（取最高）', () => {
    const ch = useChallengeStore()
    ch.completeLevel(1, 2)
    expect(ch.isUnlocked(2)).toBe(true)
    ch.completeLevel(1, 1)
    expect(ch.starsOf(1)).toBe(2)
  })
})
