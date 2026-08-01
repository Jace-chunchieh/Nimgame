/**
 * 音效模块：WebAudio 程序化合成（无外部音频文件）
 * 后续可平滑替换为 Howler.js（PRD 11.1）
 */

let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(v: boolean) {
  enabled = v
}

function getCtx(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.15,
) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + start)
  g.gain.setValueAtTime(0.0001, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  osc.connect(g)
  g.connect(c.destination)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + dur + 0.05)
}

/** 用户点击音 */
export function sfxTap() {
  tone(880, 0, 0.08, 'sine', 0.08)
}

/** 选择阵列 */
export function sfxSelect() {
  tone(660, 0, 0.1, 'triangle', 0.12)
  tone(990, 0.06, 0.1, 'triangle', 0.1)
}

/** 滑动预览（轻扫声） */
export function sfxSwipe() {
  tone(520, 0, 0.05, 'sine', 0.05)
}

/** 核心移除（吸收声） */
export function sfxRemove() {
  tone(440, 0, 0.12, 'sawtooth', 0.08)
  tone(220, 0.02, 0.15, 'sine', 0.1)
}

/** XOR 归零 */
export function sfxStable() {
  tone(523, 0, 0.15, 'sine', 0.12)
  tone(659, 0.1, 0.15, 'sine', 0.12)
  tone(784, 0.2, 0.2, 'sine', 0.12)
}

/** 错误/失误 */
export function sfxError() {
  tone(220, 0, 0.18, 'square', 0.07)
  tone(160, 0.08, 0.2, 'square', 0.06)
}

/** AI 思考（低鸣） */
export function sfxThink() {
  tone(130, 0, 0.3, 'sawtooth', 0.03)
}

/** 胜利 */
export function sfxWin() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => tone(f, i * 0.12, 0.25, 'sine', 0.14))
}

/** 失败 */
export function sfxLose() {
  const notes = [330, 262, 196, 147]
  notes.forEach((f, i) => tone(f, i * 0.15, 0.3, 'triangle', 0.12))
}
