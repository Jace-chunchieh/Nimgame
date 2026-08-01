/** 本地存储封装（LocalStorage，PRD 11.2） */

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* 存储满或隐私模式时静默失败 */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export const KEYS = {
  settings: 'xor-nim:settings',
  records: 'xor-nim:records',
  progress: 'xor-nim:progress',
  achievements: 'xor-nim:achievements',
  streak: 'xor-nim:streak',
  totalWins: 'xor-nim:total-wins',
} as const
