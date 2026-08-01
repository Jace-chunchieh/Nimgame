import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LevelConfig } from '../types'
import { loadJSON, saveJSON, KEYS } from '../storage/storage'

/** 闯关模式关卡配置（PRD 第 10 节） */
export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '基本规则',
    objective: '理解规则：每回合选择一个阵列，移除任意数量的核心，最后一个完成操作的人获胜。',
    piles: [3, 3],
    difficulty: 'easy',
    humanFirst: true,
  },
  {
    id: 2,
    name: '认识二进制',
    objective: '每个阵列的数量都用二进制显示。观察数字与二进制位的关系。',
    piles: [5, 3],
    difficulty: 'easy',
    humanFirst: true,
  },
  {
    id: 3,
    name: '理解异或',
    objective: 'XOR 核心展示所有阵列的异或结果：某位出现奇数个 1，结果就是 1。让 XOR 归零是获胜关键。',
    piles: [4, 5, 3],
    difficulty: 'easy',
    humanFirst: true,
  },
  {
    id: 4,
    name: '制造 XOR = 0',
    objective: '在本关中，寻找让 XOR 归零的操作。提示：若 XOR = 101，某阵列的二进制某位为 1 时，可尝试将其调整到 target = pile XOR XOR。',
    piles: [7, 5, 6],
    difficulty: 'normal',
    humanFirst: true,
  },
  {
    id: 5,
    name: '寻找必胜操作',
    objective: '必胜操作 = 使 XOR 归零的操作。逐位思考：结果位为 1 的列必然有奇数个 1，修改其中一个阵列即可全部归零。',
    piles: [9, 8, 7, 6],
    difficulty: 'normal',
    humanFirst: true,
  },
  {
    id: 6,
    name: '挑战困难 AI',
    objective: '困难 AI 完全采用必胜算法。只有保持每次操作后 XOR = 0，才能战胜它。',
    piles: [5, 4, 3, 2, 1],
    difficulty: 'hard',
    humanFirst: true,
  },
]

/** 闯关进度（本地持久化，存储已解锁的最大关卡编号） */
export const useChallengeStore = defineStore('challenge', () => {
  const unlocked = ref<number>(loadJSON<number>(KEYS.progress, 1))

  function isUnlocked(id: number) {
    return id <= unlocked.value
  }

  function completeLevel(id: number) {
    if (id >= unlocked.value && id < LEVELS.length) {
      unlocked.value = id + 1
      saveJSON(KEYS.progress, unlocked.value)
    }
  }

  function resetProgress() {
    unlocked.value = 1
    saveJSON(KEYS.progress, unlocked.value)
  }

  return { unlocked, isUnlocked, completeLevel, resetProgress }
})
