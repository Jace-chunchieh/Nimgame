/** 难度档位 */
export type Difficulty = 'easy' | 'normal' | 'hard'

/** 玩家类型（双人模式为 p1/p2 本地轮流） */
export type Player = 'human' | 'ai' | 'p1' | 'p2'

/** 游戏模式 */
export type GameMode = 'quick' | 'challenge' | 'pvp'

/** 游戏状态机 */
export type GameStatus =
  | 'ready'
  | 'player-turn'
  | 'ai-thinking'
  | 'game-over'

/** 一步操作记录 */
export interface Move {
  /** 操作发生的回合序号（从 1 开始） */
  round: number
  player: Player
  /** 选择的阵列下标 */
  pileIndex: number
  /** 移除数量 */
  remove: number
  /** 操作前数量 */
  before: number
  /** 操作后数量 */
  after: number
  /** 操作前 XOR */
  xorBefore: number
  /** 操作后 XOR */
  xorAfter: number
  /** 是否为最优操作（使 XOR 归零的操作） */
  isOptimal: boolean
  /** 是否为关键错误回合（玩家失误且当时存在必胜操作） */
  isMistake: boolean
  /** 当时 AI 建议的最优操作描述 */
  suggestion?: string
}

/** 完整游戏状态（对应 PRD 第 13 节） */
export interface GameState {
  piles: number[]
  currentPlayer: Player
  status: GameStatus
  difficulty: Difficulty
  winner: string | null
  history: Move[]
  /** 当前回合数 */
  round: number
  /** 玩家先手 */
  humanFirst: boolean
  /** 本局已使用提示次数 */
  hintUsed: number
  /** 本局开始时间戳 */
  startedAt: number
}

/** 一局结束后的统计 */
export interface GameStats {
  rounds: number
  optimalMoves: number
  zeroXorMoves: number
  mistakes: number
  /** 策略评分 0-100 */
  score: number
  /** 对局总时长（毫秒） */
  durationMs: number
}

/** 闯关星级（1-3，按最优操作比例评定） */
export type LevelStars = Record<number, number>

/** 战绩记录（持久化） */
export interface MatchRecord {
  id: string
  date: number
  mode: GameMode
  difficulty: Difficulty
  level?: number
  piles: number[]
  winner: 'human' | 'ai' | 'p1' | 'p2'
  humanFirst: boolean
  stats: GameStats
}

/** 关卡配置 */
export interface LevelConfig {
  id: number
  name: string
  objective: string
  piles: number[]
  difficulty: Difficulty
  humanFirst: boolean
}
