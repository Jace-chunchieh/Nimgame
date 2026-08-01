<template>
  <div class="xor-core-wrap">
    <div
      class="xor-core"
      :class="{
        stable,
        unstable: !stable && !empty,
        empty,
        thinking,
        absorbing,
      }"
    >
      <div class="core-halo"></div>
      <div class="core-ring"></div>
      <div v-if="thinking" class="scanline"></div>
      <div class="core-inner">
        <span class="xor-binary">{{ displayBinary }}</span>
        <span class="xor-label">XOR</span>
      </div>
    </div>
    <div class="xor-status" :class="{ stable }">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toBinary } from '../engine/xorCalculator'

const props = defineProps<{
  xorValue: number
  bitWidth: number
  stable: boolean
  thinking: boolean
  empty: boolean
  absorbing: boolean
}>()

const display = ref(props.xorValue)

// 阶段3：二进制快速变化（111 → 011 → 000 滚动后定格）
// 系统开启"减弱动态效果"时直接定格
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

watch(
  () => props.xorValue,
  (newVal, oldVal) => {
    if (newVal === oldVal || reduceMotion) return
    let ticks = 0
    const total = 3
    const timer = setInterval(() => {
      ticks++
      display.value = Math.floor(Math.random() * (1 << props.bitWidth))
      if (ticks >= total) {
        clearInterval(timer)
        display.value = newVal
      }
    }, 90)
  },
)

const displayBinary = computed(() => toBinary(display.value, props.bitWidth))

const statusText = computed(() => {
  if (props.thinking) return 'AI THINKING · 系统扫描中'
  if (props.empty) return '系统已清空'
  if (props.stable) return '系统即将稳定 · XOR = 0'
  return '能量不稳定 · 需要吸收'
})
</script>

<style scoped>
.xor-core-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.xor-core {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.4s ease, border-color 0.4s ease;
}

.core-halo {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  opacity: 0;
}

.core-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid currentColor;
}

.core-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.xor-binary {
  font-family: 'Consolas', monospace;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #f8fafc;
}

.xor-label {
  font-size: 10px;
  letter-spacing: 3px;
  opacity: 0.8;
}

.xor-status {
  font-size: 12px;
  letter-spacing: 1px;
  color: #f87171;
  font-weight: 600;
  min-height: 16px;
}

.xor-status.stable {
  color: #34d399;
}

/* 不稳定：橙红 + 波动 + 震动 */
.xor-core.unstable {
  background: radial-gradient(circle at 35% 30%, rgba(251, 146, 60, 0.5), rgba(127, 29, 29, 0.85));
  border: 2px solid #f97316;
  color: #f97316;
  animation: unstableShake 0.35s ease-in-out infinite;
}

.unstable .core-halo {
  opacity: 1;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.25), transparent 70%);
  animation: haloPulse 1.2s ease-in-out infinite;
}

@keyframes unstableShake {
  0%, 100% { transform: translate(0, 0); box-shadow: 0 0 18px rgba(249, 115, 22, 0.6); }
  25% { transform: translate(-1.5px, 1px); }
  50% { transform: translate(1.5px, -1px); }
  75% { transform: translate(-1px, -1.5px); }
}

@keyframes haloPulse {
  0%, 100% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.25); opacity: 1; }
}

/* 稳定：青绿 + 光环扩散 */
.xor-core.stable {
  background: radial-gradient(circle at 35% 30%, rgba(52, 211, 153, 0.5), rgba(6, 78, 59, 0.85));
  border: 2px solid #34d399;
  color: #34d399;
}

.stable .core-halo {
  opacity: 1;
  background: radial-gradient(circle, rgba(52, 211, 153, 0.3), transparent 70%);
  animation: stableRings 1.6s ease-out infinite;
}

@keyframes stableRings {
  0% { transform: scale(0.7); opacity: 0.9; }
  100% { transform: scale(1.6); opacity: 0; }
}

/* 空状态 */
.xor-core.empty {
  background: radial-gradient(circle at 35% 30%, rgba(148, 163, 184, 0.3), rgba(30, 41, 59, 0.9));
  border: 2px solid #64748b;
  color: #94a3b8;
}

/* AI 思考：旋转 + 扫描线 */
.xor-core.thinking {
  border: 2px dashed #fbbf24;
  color: #fbbf24;
  animation: thinkingRotate 1.2s linear infinite;
}

.xor-core.thinking .core-ring {
  animation: ringPulse 0.8s ease-in-out infinite;
}

.scanline {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(251, 191, 36, 0.55) 48%,
    rgba(251, 191, 36, 0.15) 52%,
    transparent 100%
  );
  background-size: 100% 20%;
  background-repeat: no-repeat;
  animation: scanMove 0.9s linear infinite;
  pointer-events: none;
}

@keyframes scanMove {
  0% { background-position: 0 -100%; }
  100% { background-position: 0 200%; }
}

@keyframes thinkingRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes ringPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}

/* 吸收中 */
.xor-core.absorbing {
  animation: absorbPulse 0.5s ease-in-out 2;
}

@keyframes absorbPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
</style>
