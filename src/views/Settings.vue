<template>
  <div class="settings">
    <div class="page-head">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <h2>设置</h2>
    </div>

    <div class="set-group">
      <div class="sg-title">默认难度</div>
      <div class="sg-seg">
        <button
          v-for="d in diffs"
          :key="d.value"
          class="seg-btn"
          :class="{ active: game.settings.difficulty === d.value }"
          @click="game.updateSettings({ difficulty: d.value })"
        >{{ d.label }}</button>
      </div>
    </div>

    <div class="set-group">
      <div class="sg-title">对战参数（人机 / 双人共用）</div>
      <div class="sg-row">
        <span class="sg-label">阵列数量</span>
        <div class="sg-stepper">
          <button class="step-btn" @click="changePiles(-1)">−</button>
          <span class="step-val">{{ game.settings.pileCount }}</span>
          <button class="step-btn" @click="changePiles(1)">+</button>
        </div>
      </div>
      <div class="sg-row">
        <span class="sg-label">每组最多核心</span>
        <div class="sg-stepper">
          <button class="step-btn" @click="changeMax(-1)">−</button>
          <span class="step-val">{{ game.settings.maxPerPile }}</span>
          <button class="step-btn" @click="changeMax(1)">+</button>
        </div>
      </div>
      <div class="sg-row">
        <span class="sg-label">玩家先手</span>
        <button
          class="toggle"
          :class="{ on: game.settings.humanFirst }"
          @click="game.updateSettings({ humanFirst: !game.settings.humanFirst })"
        >
          <span class="toggle-dot"></span>
        </button>
      </div>
      <div class="sg-note">双人对战固定为玩家 1 先手，此设置仅影响人机对战</div>
    </div>

    <div class="set-group">
      <div class="sg-title">反馈</div>
      <div class="sg-row">
        <span class="sg-label">音效</span>
        <button
          class="toggle"
          :class="{ on: game.settings.sound }"
          @click="onToggleSound"
        >
          <span class="toggle-dot"></span>
        </button>
      </div>
      <div class="sg-row">
        <span class="sg-label">震动反馈</span>
        <button
          class="toggle"
          :class="{ on: game.settings.vibration }"
          @click="game.updateSettings({ vibration: !game.settings.vibration })"
        >
          <span class="toggle-dot"></span>
        </button>
      </div>
      <div class="sg-row">
        <span class="sg-label">低性能模式</span>
        <button
          class="toggle"
          :class="{ on: game.settings.lowPower }"
          @click="game.updateSettings({ lowPower: !game.settings.lowPower })"
        >
          <span class="toggle-dot"></span>
        </button>
      </div>
    </div>

    <div class="set-group">
      <div class="sg-title">数据</div>
      <div class="sg-row">
        <span class="sg-label">重置闯关进度</span>
        <button class="danger-btn" @click="onResetProgress">重置</button>
      </div>
    </div>

    <p class="version">XOR NIM v1.0.0 · 量子异或竞技场</p>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '../store/gameStore'
import { useChallengeStore } from '../store/challengeStore'
import { setSoundEnabled } from '../sound/sfx'
import type { Difficulty } from '../types'

defineEmits<{ back: [] }>()
const game = useGameStore()
const challenge = useChallengeStore()

const diffs: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: '简单' },
  { value: 'normal', label: '普通' },
  { value: 'hard', label: '困难' },
]

function changePiles(delta: number) {
  const v = Math.max(3, Math.min(5, game.settings.pileCount + delta))
  game.updateSettings({ pileCount: v })
}

function changeMax(delta: number) {
  const v = Math.max(3, Math.min(15, game.settings.maxPerPile + delta))
  game.updateSettings({ maxPerPile: v })
}

function onToggleSound() {
  const v = !game.settings.sound
  game.updateSettings({ sound: v })
  setSoundEnabled(v)
}

function onResetProgress() {
  if (confirm('确定重置全部闯关进度吗？')) {
    challenge.resetProgress()
  }
}
</script>

<style scoped>
.settings {
  min-height: 100dvh;
  padding-bottom: 30px;
}

.page-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
}

.back-btn {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.35);
  color: #94a3b8;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
}

.page-head h2 {
  font-size: 18px;
  letter-spacing: 2px;
  color: #e2e8f0;
}

.set-group {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 204, 0, 0.12);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
}

.sg-title {
  font-size: 12px;
  color: #64748b;
  letter-spacing: 2px;
  margin-bottom: 10px;
}

.sg-seg {
  display: flex;
  gap: 8px;
}

.seg-btn {
  flex: 1;
  border: 1px solid rgba(100, 116, 139, 0.4);
  background: transparent;
  color: #94a3b8;
  border-radius: 10px;
  padding: 10px 0;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.seg-btn.active {
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  border-color: transparent;
  color: #041018;
}

.sg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(51, 65, 85, 0.4);
}

.sg-row:last-child { border-bottom: none; }

.sg-note {
  font-size: 11px;
  color: #475569;
  padding-top: 2px;
}

.sg-label {
  font-size: 14px;
  color: #cbd5e1;
}

.sg-stepper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-btn {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: 1px solid rgba(255, 204, 0, 0.4);
  background: rgba(184, 134, 11, 0.15);
  color: #ffcc00;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.step-val {
  font-size: 15px;
  font-weight: 800;
  color: #e2e8f0;
  font-family: 'Consolas', monospace;
  min-width: 24px;
  text-align: center;
}

.toggle {
  width: 50px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: rgba(51, 65, 85, 0.8);
  position: relative;
  cursor: pointer;
  transition: background 0.2s ease;
}

.toggle.on {
  background: linear-gradient(135deg, #b8860b, #ffcc00);
}

.toggle-dot {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: transform 0.2s ease;
}

.toggle.on .toggle-dot {
  transform: translateX(22px);
}

.danger-btn {
  border: 1px solid rgba(248, 113, 113, 0.4);
  background: rgba(127, 29, 29, 0.4);
  color: #fca5a5;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 12px;
  cursor: pointer;
}

.version {
  text-align: center;
  font-size: 11px;
  color: #475569;
  margin-top: 20px;
}
</style>
