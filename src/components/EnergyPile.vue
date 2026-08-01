<template>
  <div
    class="energy-pile"
    :class="{
      selected,
      dimmed: dimmed && !selected,
      disabled,
      'ai-target': isAiTarget,
      highlighted,
    }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div class="pile-head">
      <span class="pile-label">{{ label }}</span>
      <span class="pile-count">{{ count }}</span>
    </div>

    <div class="pile-grid" :style="{ width: gridCols * cell + 'px' }">
      <div
        v-for="(_, i) in count"
        :key="i"
        class="core-item"
        :class="{
          keep: i < keepCount,
          remove: i >= keepCount,
          'pulse-lock': i >= keepCount && previewRemove > 0,
        }"
        :style="{
          width: cell + 'px',
          height: cell + 'px',
        }"
      ></div>
      <div
        v-if="previewRemove > 0"
        class="cut-line"
        :style="{ left: (keepCount * cell - 2) + 'px' }"
      ></div>
    </div>

    <div class="pile-binary">
      <span class="binary-text">{{ binaryStr }}</span>
      <span v-if="previewRemove > 0" class="preview-text">
        {{ count }} → {{ keepCount }} · 移除 {{ previewRemove }}
      </span>
    </div>

    <div
      v-if="selected && previewRemove > 0"
      class="pile-confirm"
      @pointerdown.stop
    >
      <button class="confirm-btn" @click="onConfirmClick">确认移除 {{ previewRemove }}</button>
      <button class="cancel-btn" aria-label="取消" @click="$emit('cancel')">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toBinary } from '../engine/xorCalculator'
import { sfxSwipe, sfxRemove } from '../sound/sfx'
import { vibrate } from '../utils/haptics'

const props = defineProps<{
  label: string
  count: number
  selected: boolean
  dimmed: boolean
  disabled: boolean
  bitWidth: number
  isAiTarget: boolean
  highlighted?: boolean
  resetSignal: number
  vibration?: boolean
}>()

const emit = defineEmits<{
  select: []
  previewChange: [remove: number]
  swipeEnd: [remove: number]
  confirm: []
  cancel: []
}>()

const cell = 26
const gridCols = 5
const previewRemove = ref(0)
let dragging = false
let startX = 0
let startY = 0
let lockedAxis: 'h' | 'v' | null = null
let swipeUpDone = false
let lastSwipeSound = 0

const keepCount = computed(() => Math.max(0, props.count - previewRemove.value))
const binaryStr = computed(() => toBinary(props.count, props.bitWidth))

function onConfirmClick() {
  if (previewRemove.value > 0) {
    sfxRemove()
    if (props.vibration !== false) vibrate(20)
    emit('confirm')
  }
}

function onPointerDown(e: PointerEvent) {
  if (props.disabled) return
  dragging = true
  lockedAxis = null
  swipeUpDone = false
  startX = e.clientX
  startY = e.clientY
  previewRemove.value = 0
  // 捕获指针：手指滑出阵列边界后事件仍发给本元素，避免跨阵列拖动中断
  const el = e.currentTarget as HTMLElement | null
  el?.setPointerCapture?.(e.pointerId)
  emit('select')
}

function onPointerMove(e: PointerEvent) {
  if (!dragging || swipeUpDone) return
  const dx = startX - e.clientX
  const dy = startY - e.clientY

  // 首次移动超过阈值时锁定方向：横向=调整数量，纵向=上滑确认
  if (!lockedAxis) {
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return
    lockedAxis = Math.abs(dy) > Math.abs(dx) ? 'v' : 'h'
  }

  if (lockedAxis === 'h') {
    let remove = Math.round(dx / 30)
    remove = Math.max(0, Math.min(props.count - 1, remove))
    if (remove !== previewRemove.value) {
      previewRemove.value = remove
      const now = performance.now()
      if (now - lastSwipeSound > 120) {
        sfxSwipe()
        lastSwipeSound = now
      }
      // 每滑动一格轻微震动，提升操作手感
      if (props.vibration !== false) vibrate(5)
      emit('previewChange', remove)
    }
  } else if (dy >= 50) {
    // 上滑确认：仅当已有移除预览时生效，避免误触
    if (previewRemove.value > 0) {
      swipeUpDone = true
      sfxRemove()
      if (props.vibration !== false) vibrate([20, 30])
      emit('confirm')
    }
  }
}

function onPointerUp() {
  if (!dragging) return
  dragging = false
  if (previewRemove.value > 0 && !swipeUpDone) {
    if (props.vibration !== false) vibrate(10)
    emit('swipeEnd', previewRemove.value)
  }
}

watch(
  () => props.resetSignal,
  () => {
    previewRemove.value = 0
    dragging = false
  },
)
</script>

<style scoped>
.energy-pile {
  position: relative;
  padding: 10px 12px 12px;
  border-radius: 16px;
  background: linear-gradient(160deg, rgba(15, 23, 42, 0.9), rgba(10, 15, 32, 0.9));
  border: 1px solid rgba(255, 204, 0, 0.15);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease,
    box-shadow 0.25s ease, border-color 0.25s ease;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.energy-pile.selected {
  transform: translateY(-6px);
  border-color: rgba(255, 204, 0, 0.8);
  box-shadow: 0 0 18px rgba(255, 204, 0, 0.35), 0 8px 24px rgba(0, 0, 0, 0.4);
}

.energy-pile.dimmed {
  opacity: 0.45;
}

.energy-pile.disabled {
  opacity: 0.7;
}

.energy-pile.ai-target .core-item {
  animation: aiFlash 0.9s ease-in-out infinite;
}

/* 提示按钮高亮的最优操作阵列 */
.energy-pile.highlighted {
  border-color: rgba(255, 204, 0, 0.95) !important;
  box-shadow: 0 0 22px rgba(255, 204, 0, 0.55), 0 8px 24px rgba(0, 0, 0, 0.4);
}

.energy-pile.highlighted .core-item {
  animation: hintFlash 0.8s ease-in-out infinite;
}

@keyframes hintFlash {
  0%, 100% { box-shadow: 0 0 6px rgba(255, 204, 0, 0.4); }
  50% { box-shadow: 0 0 16px rgba(255, 204, 0, 1); }
}

@keyframes aiFlash {
  0%, 100% { box-shadow: none; }
  50% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.9); }
}

.pile-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pile-label {
  font-size: 13px;
  letter-spacing: 2px;
  color: #ffd966;
  font-weight: 600;
}

.pile-count {
  font-family: 'Consolas', monospace;
  font-size: 20px;
  font-weight: 700;
  color: #e2e8f0;
}

.pile-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  margin: 0 auto 8px;
}

.core-item {
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #ffcc00, #b8860b 70%);
  box-shadow: 0 0 6px rgba(255, 204, 0, 0.5);
  transition: background 0.15s ease, transform 0.15s ease;
}

.core-item.keep {
  background: radial-gradient(circle at 35% 30%, #ffcc00, #b8860b 70%);
}

.core-item.remove {
  background: radial-gradient(circle at 35% 30%, #fda4af, #be123c 70%);
  box-shadow: 0 0 8px rgba(244, 63, 94, 0.7);
}

.core-item.pulse-lock {
  animation: lockPulse 0.5s ease-in-out infinite;
  border: 2px solid rgba(244, 63, 94, 0.9);
  box-sizing: border-box;
}

@keyframes lockPulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 6px rgba(244, 63, 94, 0.7); }
  50% { transform: scale(1.25); box-shadow: 0 0 14px rgba(244, 63, 94, 1); }
}

.cut-line {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: linear-gradient(to bottom, transparent, #f43f5e, transparent);
  border-radius: 2px;
}

.pile-binary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 18px;
}

.binary-text {
  font-family: 'Consolas', monospace;
  font-size: 12px;
  color: #64748b;
  letter-spacing: 3px;
}

.preview-text {
  font-size: 11px;
  color: #fbbf24;
  font-weight: 600;
}

/* 就近确认操作条 */
.pile-confirm {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
  animation: confirmIn 0.2s ease both;
}

@keyframes confirmIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.confirm-btn {
  flex: 1;
  border: none;
  border-radius: 10px;
  padding: 11px 0;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  cursor: pointer;
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #1a1400;
  box-shadow: 0 3px 14px rgba(255, 204, 0, 0.4);
  min-height: 44px;
  transition: transform 0.12s ease;
}

.confirm-btn:active { transform: scale(0.97); }

.cancel-btn {
  width: 44px;
  min-height: 44px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(51, 65, 85, 0.6);
  color: #94a3b8;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
}
</style>
