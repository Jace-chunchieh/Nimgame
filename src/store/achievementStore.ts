import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameStats } from '../types'
import { loadJSON, saveJSON, KEYS } from '../storage/storage'

export interface AchievementDef {
  id: string
  name: string
  desc: string
  icon: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-win', name: '初战告捷', desc: '首次在人机对战中获胜', icon: '⚔' },
  { id: 'streak-3', name: '三连胜', desc: '人机对战连续获胜 3 局', icon: '🔥' },
  { id: 'hard-win', name: '困难克星', desc: '击败困难难度 AI', icon: '☠' },
  { id: 'perfect', name: '完美操作', desc: '零失误赢得一局', icon: '✨' },
  { id: 'score-80', name: '策略大师', desc: '单局策略评分达到 80 分', icon: '🧠' },
  { id: 'challenge-clear', name: '闯关通关', desc: '通过挑战模式第 6 关', icon: '🏆' },
  { id: 'pvp-win', name: '双人首胜', desc: '在双人对战中获胜', icon: '🤝' },
  { id: 'win-10', name: '常胜将军', desc: '累计取得 10 场胜利', icon: '👑' },
]

export interface AchievementCheck {
  winner: string
  mode: string
  difficulty: string
  stats: GameStats
  level?: number
}

export const useAchievementStore = defineStore('achievement', () => {
  const unlocked = ref<string[]>(loadJSON<string[]>(KEYS.achievements, []))
  const winStreak = ref<number>(loadJSON<number>(KEYS.streak, 0))
  const totalWins = ref<number>(loadJSON<number>(KEYS.totalWins, 0))

  function isUnlocked(id: string) {
    return unlocked.value.includes(id)
  }

  function unlock(id: string) {
    if (!unlocked.value.includes(id)) {
      unlocked.value.push(id)
      saveJSON(KEYS.achievements, unlocked.value)
    }
  }

  /** 对局结束后检查成就 */
  function checkAll(c: AchievementCheck) {
    if (c.mode === 'quick' || c.mode === 'challenge') {
      if (c.winner === 'human') {
        totalWins.value += 1
        saveJSON(KEYS.totalWins, totalWins.value)
        winStreak.value += 1
        saveJSON(KEYS.streak, winStreak.value)
        unlock('first-win')
        if (winStreak.value >= 3) unlock('streak-3')
        if (c.difficulty === 'hard') unlock('hard-win')
        if (c.stats.mistakes === 0) unlock('perfect')
        if (c.stats.score >= 80) unlock('score-80')
        if (totalWins.value >= 10) unlock('win-10')
      } else {
        winStreak.value = 0
        saveJSON(KEYS.streak, 0)
      }
      if (c.mode === 'challenge' && c.level === 6 && c.winner === 'human') {
        unlock('challenge-clear')
      }
    } else if (c.mode === 'pvp' && (c.winner === 'p1' || c.winner === 'p2')) {
      unlock('pvp-win')
    }
  }

  function resetAll() {
    unlocked.value = []
    winStreak.value = 0
    totalWins.value = 0
    saveJSON(KEYS.achievements, [])
    saveJSON(KEYS.streak, 0)
    saveJSON(KEYS.totalWins, 0)
  }

  return {
    unlocked,
    winStreak,
    totalWins,
    isUnlocked,
    checkAll,
    resetAll,
  }
})
