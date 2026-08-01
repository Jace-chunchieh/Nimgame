<template>
  <div class="review-overlay">
    <div class="review-panel">
      <div class="rp-head">
        <span class="rp-title">对局复盘</span>
        <button class="rp-close" @click="$emit('close')">✕</button>
      </div>

      <div class="rp-step-info">
        第 {{ step }} / {{ history.length }} 步
      </div>

      <div class="rp-board">
        <div class="rp-piles">
          <div v-for="(pile, i) in currentPiles" :key="i" class="rp-pile">
            <div class="rp-pile-head">
              <span class="rp-label">{{ letterOf(i) }}</span>
              <span class="rp-count">{{ pile }}</span>
            </div>
            <div class="rp-cores">
              <span
                v-for="(_, c) in pile"
                :key="c"
                class="rp-core"
                :class="{ removed: c >= pile }"
              ></span>
            </div>
            <div class="rp-binary">{{ toBinary(pile, bitWidthOf) }}</div>
          </div>
        </div>
        <div class="rp-xor" :class="{ stable: currentXor === 0 }">
          XOR = {{ toBinary(currentXor, bitWidthOf) }}
          <span v-if="currentXor === 0">· 稳定</span>
          <span v-else>· 不稳定</span>
        </div>
      </div>

      <div class="rp-moves">
        <div
          v-for="(m, i) in history"
          :key="i"
          class="rp-move"
          :class="{ active: i === step - 1, human: m.player === 'human' || m.player === 'p1' || m.player === 'p2', ai: m.player === 'ai' }"
        >
          <span class="rm-round">{{ m.round }}</span>
          <span class="rm-player">{{ playerName(m.player) }}</span>
          <span class="rm-action">阵列 {{ letterOf(m.pileIndex) }} −{{ m.remove }}（{{ m.before }}→{{ m.after }}）</span>
          <span class="rm-xor">{{ toBinary(m.xorAfter, bitWidthOf) }}</span>
          <span v-if="m.isOptimal" class="rm-badge good">最优</span>
          <span v-else-if="m.isMistake" class="rm-badge bad">失误</span>
        </div>
      </div>

      <div v-if="currentMove && currentMove.suggestion" class="rp-suggest">
        💡 {{ currentMove.suggestion }}
      </div>

      <div class="rp-btns">
        <button class="rp-btn" :disabled="step <= 0" @click="step--">◀ 上一步</button>
        <button class="rp-btn primary" :disabled="step >= history.length" @click="step++">下一步 ▶</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Move } from '../types'
import { applyMove } from '../engine/nimRules'
import { nimSum, toBinary } from '../engine/xorCalculator'

const props = defineProps<{
  history: Move[]
  initialPiles: number[]
}>()

defineEmits<{ close: [] }>()

// step = 已执行的步数（0 = 初始局面，history.length = 终局）
const step = ref(props.history.length)

watch(
  () => props.history.length,
  () => {
    step.value = props.history.length
  },
)

const currentPiles = computed(() => {
  let piles = [...props.initialPiles]
  for (let i = 0; i < step.value && i < props.history.length; i++) {
    piles = applyMove(piles, props.history[i].pileIndex, props.history[i].remove)
  }
  return piles
})

const currentXor = computed(() => nimSum(currentPiles.value))
const currentMove = computed(() =>
  step.value > 0 ? props.history[step.value - 1] : null,
)
const bitWidthOf = computed(() =>
  Math.max(3, Math.max(...props.initialPiles, 0).toString(2).length),
)

const letterOf = (i: number) => String.fromCharCode(65 + i)

const playerName = (p: string) => {
  if (p === 'ai') return 'AI'
  if (p === 'p1') return '玩家 1'
  if (p === 'p2') return '玩家 2'
  return '玩家'
}
</script>

<style scoped>
.review-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.92);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
  padding: 14px;
}

.review-panel {
  width: min(96vw, 440px);
  max-height: 92vh;
  overflow-y: auto;
  border-radius: 20px;
  padding: 16px;
  background: linear-gradient(165deg, rgba(30, 26, 10, 0.98), rgba(10, 8, 2, 0.98));
  border: 1px solid rgba(255, 204, 0, 0.4);
  box-shadow: 0 0 40px rgba(255, 204, 0, 0.15);
}

.rp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.rp-title {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 3px;
  color: #ffcc00;
}

.rp-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(51, 65, 85, 0.6);
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
}

.rp-step-info {
  text-align: center;
  font-size: 12px;
  color: #d4c68a;
  margin-bottom: 10px;
}

.rp-board {
  background: rgba(0, 0, 0, 0.35);
  border-radius: 14px;
  padding: 12px;
}

.rp-piles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rp-pile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rp-pile-head {
  width: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rp-label {
  font-size: 11px;
  color: #ffd966;
  font-weight: 700;
}

.rp-count {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  font-family: 'Consolas', monospace;
}

.rp-cores {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  flex: 1;
}

.rp-core {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffe680, #cc9f00 70%);
  box-shadow: 0 0 4px rgba(255, 204, 0, 0.5);
}

.rp-binary {
  font-family: 'Consolas', monospace;
  font-size: 10px;
  color: #8a7530;
  width: 40px;
  text-align: right;
}

.rp-xor {
  margin-top: 10px;
  text-align: center;
  font-family: 'Consolas', monospace;
  font-size: 14px;
  font-weight: 800;
  color: #f87171;
  letter-spacing: 2px;
}

.rp-xor.stable {
  color: #34d399;
}

.rp-moves {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.rp-move {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: #d4c68a;
}

.rp-move.active {
  background: rgba(255, 204, 0, 0.12);
  border: 1px solid rgba(255, 204, 0, 0.35);
}

.rm-round {
  font-family: 'Consolas', monospace;
  color: #8a7530;
  width: 20px;
}

.rm-player {
  font-weight: 700;
  width: 44px;
  color: #ffd966;
}

.rm-action {
  flex: 1;
}

.rm-xor {
  font-family: 'Consolas', monospace;
  color: #f87171;
}

.rp-move.human .rm-xor { color: #f87171; }
.rp-move.ai .rm-xor { color: #fbbf24; }

.rm-badge {
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 6px;
}

.rm-badge.good {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}

.rm-badge.bad {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.rp-suggest {
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(251, 191, 36, 0.08);
  border-left: 3px solid #fbbf24;
  font-size: 11px;
  color: #fde68a;
  line-height: 1.6;
}

.rp-btns {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.rp-btn {
  flex: 1;
  border: 1px solid rgba(255, 204, 0, 0.35);
  background: rgba(184, 134, 11, 0.15);
  color: #ffcc00;
  border-radius: 10px;
  padding: 11px 0;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
}

.rp-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.rp-btn.primary {
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #1a1400;
  border: none;
}
</style>
