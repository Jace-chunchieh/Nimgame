import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Difficulty, GameMode, GameState, GameStats, Move } from '../types'
import { applyMove, isLegalMove } from '../engine/nimRules'
import { nimSum, isGameOver } from '../engine/xorCalculator'
import { decideAIMove, findOptimalMove, getSuggestion } from '../engine/nimAI'
import type { AIMove } from '../engine/nimAI'
import { loadJSON, saveJSON, KEYS } from '../storage/storage'

export interface GameSettings {
  difficulty: Difficulty
  pileCount: number
  maxPerPile: number
  sound: boolean
  vibration: boolean
  lowPower: boolean
  humanFirst: boolean
}

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'normal',
  pileCount: 4,
  maxPerPile: 9,
  sound: true,
  vibration: true,
  lowPower: false,
  humanFirst: true,
}

/** 随机生成一局（快速对战，PRD 4.2.1） */
function randomPiles(count: number, max: number): number[] {
  const piles: number[] = []
  for (let i = 0; i < count; i++) {
    piles.push(1 + Math.floor(Math.random() * max))
  }
  // 避免一开局就是必败局面（对新手不友好）：保证至少一个可选操作
  if (piles.reduce((a, b) => a ^ b, 0) === 0) {
    const i = Math.floor(Math.random() * piles.length)
    piles[i] = Math.max(1, piles[i] - 1)
  }
  return piles
}

/** 一局内提示次数上限 */
export const HINT_LIMIT = 3

/** 计算一局统计（PRD 第 9 节） */
export function computeStats(history: Move[], durationMs = 0): GameStats {
  const optimalMoves = history.filter(
    (m) => m.player === 'human' && m.isOptimal,
  ).length
  const zeroXorMoves = history.filter(
    (m) => m.player === 'human' && m.xorAfter === 0,
  ).length
  const mistakes = history.filter((m) => m.player === 'human' && m.isMistake).length
  const humanMoves = history.filter((m) => m.player === 'human').length
  const optimalRatio = humanMoves ? optimalMoves / humanMoves : 0
  const score = Math.round(
    Math.max(0, Math.min(100, optimalRatio * 100 - mistakes * 8 + (zeroXorMoves ? 10 : 0))),
  )
  return { rounds: history.length, optimalMoves, zeroXorMoves, mistakes, score, durationMs }
}

export const useGameStore = defineStore('game', () => {
  const settings = ref<GameSettings>(loadJSON(KEYS.settings, DEFAULT_SETTINGS))
  const state = ref<GameState>({
    piles: [],
    currentPlayer: 'human',
    status: 'ready',
    difficulty: 'normal',
    winner: null,
    history: [],
    round: 1,
    humanFirst: true,
    hintUsed: 0,
    startedAt: 0,
  })
  const mode = ref<GameMode>('quick')
  const level = ref(1)
  const lastStats = ref<GameStats | null>(null)
  /** 本局初始阵列（用于战绩展示） */
  const initialPiles = ref<number[]>([])

  function updateSettings(patch: Partial<GameSettings>) {
    settings.value = { ...settings.value, ...patch }
    saveJSON(KEYS.settings, settings.value)
  }

  /** 新开一局 */
  function newGame(opts: {
    piles?: number[]
    difficulty?: Difficulty
    humanFirst?: boolean
    gameMode?: GameMode
    level?: number
  }) {
    const isPvp = opts.gameMode === 'pvp'
    const humanFirst = opts.humanFirst ?? settings.value.humanFirst
    const piles = opts.piles ?? randomPiles(settings.value.pileCount, settings.value.maxPerPile)
    mode.value = opts.gameMode ?? 'quick'
    level.value = opts.level ?? 1
    initialPiles.value = [...piles]
    state.value = {
      piles,
      // 开局直接进入可操作状态，避免卡在 ready
      currentPlayer: isPvp ? 'p1' : humanFirst ? 'human' : 'ai',
      status: isPvp || humanFirst ? 'player-turn' : 'ai-thinking',
      difficulty: opts.difficulty ?? settings.value.difficulty,
      winner: null,
      history: [],
      round: 1,
      humanFirst,
      hintUsed: 0,
      startedAt: Date.now(),
    }
    lastStats.value = null
  }

  /** 玩家执行操作（AI 对战 / 双人模式共用） */
  function playerMove(pileIndex: number, remove: number): boolean {
    const s = state.value
    if (s.status !== 'player-turn') return false
    if (!isLegalMove(s.piles, pileIndex, remove)) return false

    const isPvp = mode.value === 'pvp'
    const before = s.piles[pileIndex]
    const xorBefore = nimSum(s.piles)
    const next = applyMove(s.piles, pileIndex, remove)
    const xorAfter = nimSum(next)
    const optimal = findOptimalMove(s.piles)
    const isOptimal = optimal !== null && optimal.pileIndex === pileIndex && optimal.remove === remove
    const isMistake = !isOptimal && nimSum(s.piles) !== 0 && !isPvp

    s.history.push({
      round: s.round,
      player: s.currentPlayer,
      pileIndex,
      remove,
      before,
      after: next[pileIndex],
      xorBefore,
      xorAfter,
      isOptimal,
      isMistake,
      suggestion: isMistake ? getSuggestion(s.piles) : undefined,
    })
    s.piles = next

    if (isGameOver(next)) {
      s.status = 'game-over'
      // 无合法操作的一方判负 → 另一方获胜
      s.winner = isPvp
        ? s.currentPlayer === 'p1' ? 'p2' : 'p1'
        : 'human'
      finish()
      return true
    }
    s.round += 1
    if (isPvp) {
      s.currentPlayer = s.currentPlayer === 'p1' ? 'p2' : 'p1'
      s.status = 'player-turn'
    } else {
      s.status = 'ai-thinking'
      s.currentPlayer = 'ai'
    }
    return true
  }

  /** AI 执行操作（调用前应先 setStatus('ai-thinking')） */
  function aiMove(): Move | null {
    const s = state.value
    if (s.status !== 'ai-thinking') return null
    const ai = decideAIMove(s.piles, s.difficulty)
    const before = s.piles[ai.pileIndex]
    const xorBefore = nimSum(s.piles)
    const next = applyMove(s.piles, ai.pileIndex, ai.remove)
    const xorAfter = nimSum(next)
    const move: Move = {
      round: s.round,
      player: 'ai',
      pileIndex: ai.pileIndex,
      remove: ai.remove,
      before,
      after: next[ai.pileIndex],
      xorBefore,
      xorAfter,
      isOptimal: xorAfter === 0,
      isMistake: false,
    }
    s.history.push(move)
    s.piles = next

    if (isGameOver(next)) {
      s.status = 'game-over'
      s.winner = 'ai'
      finish()
      return move
    }
    s.round += 1
    s.status = 'player-turn'
    s.currentPlayer = 'human'
    return move
  }

  function finish() {
    lastStats.value = computeStats(
      state.value.history,
      Date.now() - state.value.startedAt,
    )
  }

  /**
   * 悔棋：撤销玩家上一步操作（连同 AI 的响应）
   * 仅人机模式玩家回合可用，pvp 不支持
   */
  function undoLastMove(): boolean {
    const s = state.value
    if (s.status !== 'player-turn') return false
    if (mode.value === 'pvp') return false

    const h = s.history
    if (h.length === 0) return false

    const undoList: Move[] = []
    // 玩家回合时最后一条通常是 AI 的响应，先回滚
    let last = h[h.length - 1]
    if (last.player === 'ai') {
      h.pop()
      undoList.push(last)
    }
    // 再回滚玩家自己的操作
    last = h[h.length - 1]
    if (last && last.player === 'human') {
      h.pop()
      undoList.push(last)
    }
    if (undoList.length === 0) return false

    for (const m of undoList) {
      s.piles[m.pileIndex] = m.before
    }
    s.round = Math.max(1, s.round - undoList.length)
    s.status = 'player-turn'
    s.currentPlayer = 'human'
    s.winner = null
    return true
  }

  /** 获取当前局面最优操作提示（限次） */
  function useHint(): AIMove | null {
    const s = state.value
    if (s.status !== 'player-turn' || s.hintUsed >= HINT_LIMIT) return null
    const optimal = findOptimalMove(s.piles)
    if (!optimal) return null
    s.hintUsed += 1
    return optimal
  }

  return {
    settings,
    state,
    mode,
    level,
    lastStats,
    initialPiles,
    updateSettings,
    newGame,
    playerMove,
    aiMove,
    undoLastMove,
    useHint,
  }
})
