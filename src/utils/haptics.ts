/** 移动端震动反馈封装（PRD 5.1：手机轻微震动） */
export function vibrate(pattern: number | number[] = 15) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern)
  } catch {
    /* 不支持时忽略 */
  }
}
