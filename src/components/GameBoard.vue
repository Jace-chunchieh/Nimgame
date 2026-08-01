<template>
  <div class="game-board">
    <!-- 顶部状态区 -->
    <div class="board-top">
      <div class="bt-item">
        <span class="bt-label">回合</span>
        <span class="bt-value">{{ round }}</span>
      </div>
      <div class="bt-item">
        <span class="bt-label">{{ isPvp ? '当前' : '玩家' }}</span>
        <span
          class="bt-value"
          :class="playerClass"
        >{{ currentPlayerText }}</span>
      </div>
      <div class="bt-item">
        <span class="bt-label">模式</span>
        <span class="bt-value diff">{{ isPvp ? '双人对战' : diffText }}</span>
      </div>
      <button class="bt-exit" @click="$emit('exit')">退出</button>
    </div>

    <!-- 中间游戏区 -->
    <div class="board-middle">
      <div class="piles-area">
        <div v-if="status === 'ai-thinking'" class="area-scanline"></div>
        <EnergyPile
          v-for="(pile, i) in piles"
          :key="i"
          :data-pile-index="i"
          :label="String.fromCharCode(65 + i)"
          :count="pile"
          :selected="selectedIndex === i && previewRemove === 0"
          :dimmed="selectedIndex !== null && selectedIndex !== i"
          :disabled="status !== 'player-turn'"
          :bit-width="bitWidth"
          :is-ai-target="aiTargetIndex === i"
          :reset-signal="resetSignal"
          @select="onSelect(i)"
          @preview-change="(r: number) => onPreview(i, r)"
          @swipe-end="(r: number) => onSwipeEnd(i, r)"
        />
      </div>

      <XORCore
        ref="xorCoreRef"
        :xor-value="previewXor"
        :bit-width="bitWidth"
        :stable="previewXor === 0 && !isAllEmpty"
        :thinking="status === 'ai-thinking'"
        :empty="isAllEmpty"
        :absorbing="absorbing"
      />

      <button class="toggle-bin" @click="showBinary = !showBinary">
        {{ showBinary ? '收起位视图' : '展开位视图' }}
      </button>
      <BinaryPanel
        :piles="previewPiles"
        :xor-value="previewXor"
        :bit-width="bitWidth"
        :expanded="showBinary"
      />
    </div>

    <!-- 底部操作区 -->
    <ControlPanel
      :status="status"
      :selected-index="selectedIndex"
      :preview-remove="previewRemove"
      :piles="piles"
      :player-label="currentPlayerText"
      :pvp="isPvp"
      @confirm="onConfirm"
      @cancel="onCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import gsap from 'gsap'
import type { Difficulty } from '../types'
import { nimSum, nimSumAfterChange } from '../engine/xorCalculator'
import { sfxSelect, sfxStable, sfxRemove } from '../sound/sfx'
import { vibrate } from '../utils/haptics'
import EnergyPile from './EnergyPile.vue'
import XORCore from './XORCore.vue'
import BinaryPanel from './BinaryPanel.vue'
import ControlPanel from './ControlPanel.vue'

const props = defineProps<{
  piles: number[]
  status: string
  round: number
  currentPlayer: string
  difficulty: Difficulty
  aiTargetIndex: number | null
  bitWidth: number
  pvp?: boolean
}>()

const emit = defineEmits<{
  commit: [index: number, remove: number]
  exit: []
}>()

const isPvp = computed(() => props.pvp === true)

const diffText = computed(
  () => ({ easy: '简单', normal: '普通', hard: '困难' })[props.difficulty],
)

const currentPlayerText = computed(() => {
  if (isPvp.value) {
    return props.currentPlayer === 'p1' ? '玩家 1' : '玩家 2'
  }
  return props.currentPlayer === 'ai' ? 'AI' : '你'
})

const playerClass = computed(() => {
  if (isPvp.value) {
    return props.currentPlayer === 'p1' ? 'p1' : 'p2'
  }
  return props.currentPlayer === 'ai' ? 'ai' : ''
})

const selectedIndex = ref<number | null>(null)
const previewRemove = ref(0)
const resetSignal = ref(0)
const showBinary = ref(true)
const absorbing = ref(false)
const xorCoreRef = ref<InstanceType<typeof XORCore> | null>(null)
let commitTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (commitTimer) clearTimeout(commitTimer)
})

const previewPiles = computed(() => {
  if (selectedIndex.value === null) return props.piles
  const next = [...props.piles]
  next[selectedIndex.value] = Math.max(0, next[selectedIndex.value] - previewRemove.value)
  return next
})

const previewXor = computed(() =>
  selectedIndex.value === null
    ? nimSum(props.piles)
    : nimSumAfterChange(props.piles, selectedIndex.value, previewPiles.value[selectedIndex.value]),
)

const isAllEmpty = computed(() => props.piles.every((p) => p === 0))

function onSelect(index: number) {
  if (props.status !== 'player-turn') return
  selectedIndex.value = index
  previewRemove.value = 0
  sfxSelect()
  vibrate(15)
}

function onPreview(index: number, remove: number) {
  if (selectedIndex.value !== index) selectedIndex.value = index
  previewRemove.value = remove
}

function onSwipeEnd(_index: number, remove: number) {
  previewRemove.value = remove
  if (remove > 0) {
    sfxRemove()
    vibrate(20)
  }
}

function onCancel() {
  selectedIndex.value = null
  previewRemove.value = 0
}

function flyCores(index: number) {
  const pileEl = document.querySelector<HTMLElement>(`.energy-pile[data-pile-index="${index}"]`)
  const targetEl = xorCoreRef.value?.$el as HTMLElement | undefined
  if (!pileEl || !targetEl) return
  const targetRect = targetEl.getBoundingClientRect()
  const tx = targetRect.left + targetRect.width / 2
  const ty = targetRect.top + targetRect.height / 2
  const items = pileEl.querySelectorAll('.core-item.remove')
  items.forEach((el, i) => {
    const rect = el.getBoundingClientRect()
    const ghost = document.createElement('div')
    ghost.className = 'ghost-core'
    ghost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fda4af,#be123c);box-shadow:0 0 10px rgba(244,63,94,0.8);z-index:60;pointer-events:none;`
    document.body.appendChild(ghost)
    gsap.to(ghost, {
      x: tx - rect.left - rect.width / 2,
      y: ty - rect.top - rect.height / 2,
      scale: 0.1,
      rotate: 180,
      duration: 0.45,
      delay: i * 0.03,
      ease: 'power2.in',
      onComplete: () => ghost.remove(),
    })
  })
}

function onConfirm() {
  if (selectedIndex.value === null || previewRemove.value < 1) return
  const index = selectedIndex.value
  const remove = previewRemove.value
  const nextXor = nimSumAfterChange(
    props.piles,
    index,
    Math.max(0, props.piles[index] - remove),
  )
  absorbing.value = true
  flyCores(index)
  if (nextXor === 0) {
    sfxStable()
    vibrate([30, 40, 30])
  }
  commitTimer = setTimeout(() => {
    commitTimer = null
    absorbing.value = false
    // 粒子聚合（§5.3：达到稳定时核心粒子聚合反馈）
    const targetEl = xorCoreRef.value?.$el as HTMLElement | undefined
    if (targetEl) {
      const r = targetEl.getBoundingClientRect()
      emitParticles(r.left + r.width / 2, r.top + r.height / 2)
    }
    emit('commit', index, remove)
    selectedIndex.value = null
    previewRemove.value = 0
    resetSignal.value++
  }, 500)
}

/** 在指定视口坐标触发粒子（通过事件冒泡到 Game 视图的粒子层） */
function emitParticles(x: number, y: number) {
  const canvas = document.querySelector('.particle-layer') as HTMLCanvasElement | null
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const ev = new CustomEvent('particle-burst', {
    detail: { x: x - rect.left, y: y - rect.top },
  })
  canvas.dispatchEvent(ev)
}

watch(
  () => props.status,
  (s) => {
    if (s === 'ai-thinking') {
      selectedIndex.value = null
      previewRemove.value = 0
    }
  },
)
</script>

<style scoped>
.game-board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100%;
}

.board-top {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 14px;
  padding: 8px 12px;
}

.bt-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
  border-right: 1px solid rgba(51, 65, 85, 0.5);
}

.bt-item:last-of-type { border-right: none; }

.bt-label {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 2px;
}

.bt-value {
  font-size: 16px;
  font-weight: 800;
  color: #e2e8f0;
  font-family: 'Consolas', monospace;
}

.bt-value.ai { color: #fbbf24; }
.bt-value.p1 { color: #67e8f9; }
.bt-value.p2 { color: #f472b6; }
.bt-value.diff { font-size: 13px; }

.bt-exit {
  margin-left: auto;
  border: 1px solid rgba(100, 116, 139, 0.4);
  background: transparent;
  color: #94a3b8;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.board-middle {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.piles-area {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.area-scanline {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  z-index: 4;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(251, 191, 36, 0.14) 48%,
    rgba(251, 191, 36, 0.05) 52%,
    transparent 100%
  );
  background-size: 100% 26%;
  background-repeat: no-repeat;
  animation: areaScan 0.9s linear infinite;
}

@keyframes areaScan {
  0% { background-position: 0 -30%; }
  100% { background-position: 0 130%; }
}

.toggle-bin {
  align-self: center;
  border: none;
  background: rgba(30, 41, 59, 0.7);
  color: #7dd3fc;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
}
</style>
