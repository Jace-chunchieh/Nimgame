<template>
  <div class="home">
    <div class="logo-area float-in">
      <div class="logo-core" :class="{ stable: stats.winRate >= 50 }">
        <div class="lc-halo"></div>
        <div class="lc-inner">
          <span class="lc-symbol">⊕</span>
        </div>
      </div>
      <h1 class="logo-title">XOR NIM</h1>
      <p class="logo-sub">量子异或竞技场</p>
    </div>

    <button class="boot-core float-in" @click="$emit('navigate', 'game')">
      <span class="bc-ring"></span>
      <span class="bc-icon">◉</span>
      <span class="bc-text">启动量子核心</span>
    </button>

    <div class="stats-summary float-in">
      <div class="ss-item">
        <span class="ss-num">{{ stats.wins }}</span>
        <span class="ss-label">胜</span>
      </div>
      <div class="ss-item">
        <span class="ss-num">{{ stats.losses }}</span>
        <span class="ss-label">负</span>
      </div>
      <div class="ss-item">
        <span class="ss-num">{{ stats.winRate }}%</span>
        <span class="ss-label">胜率</span>
      </div>
    </div>

    <div class="main-btns float-in">
      <button class="mb-btn primary" @click="$emit('navigate', 'game')">
        <span class="mb-icon">⚔</span>
        <span class="mb-text">
          <span class="mb-title">人机对战</span>
          <span class="mb-desc">随机生成能量阵列 · 三档 AI 难度</span>
        </span>
      </button>
      <button class="mb-btn accent" @click="$emit('navigate', 'challenge')">
        <span class="mb-icon">◆</span>
        <span class="mb-text">
          <span class="mb-title">挑战模式</span>
          <span class="mb-desc">6 个关卡 · 逐步掌握异或策略</span>
        </span>
      </button>
      <button class="mb-btn duo" @click="$emit('navigate', 'pvp')">
        <span class="mb-icon">⚡</span>
        <span class="mb-text">
          <span class="mb-title">双人对战</span>
          <span class="mb-desc">同一设备轮流操作 · 一较高下</span>
        </span>
      </button>
      <button class="mb-btn ghost" @click="$emit('navigate', 'tutorial')">
        <span class="mb-icon">?</span>
        <span class="mb-text">
          <span class="mb-title">教学模式</span>
          <span class="mb-desc">了解规则与二进制异或</span>
        </span>
      </button>
    </div>

    <div class="bottom-nav float-in">
      <button class="bn-item" @click="$emit('navigate', 'records')">
        <span class="bn-icon">▤</span>
        <span>战绩</span>
      </button>
      <button class="bn-item" @click="$emit('navigate', 'tutorial')">
        <span class="bn-icon">▦</span>
        <span>图鉴</span>
      </button>
      <button class="bn-item" @click="$emit('navigate', 'settings')">
        <span class="bn-icon">⚙</span>
        <span>设置</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRecordStore } from '../store/recordStore'

defineEmits<{ navigate: [view: string] }>()
const recordStore = useRecordStore()

const stats = computed(() => {
  const total = recordStore.records.length
  const wins = recordStore.records.filter((r) => r.winner === 'human').length
  return {
    wins,
    losses: total - wins,
    winRate: total ? Math.round((wins / total) * 100) : 0,
  }
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100dvh;
  padding-top: 6vh;
  gap: 22px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.logo-core {
  position: relative;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 35% 30%, rgba(249, 115, 22, 0.45), rgba(127, 29, 29, 0.8));
  border: 2px solid #f97316;
  color: #f97316;
  box-shadow: 0 0 30px rgba(249, 115, 22, 0.35);
}

.logo-core.stable {
  background: radial-gradient(circle at 35% 30%, rgba(52, 211, 153, 0.45), rgba(6, 78, 59, 0.8));
  border-color: #34d399;
  color: #34d399;
  box-shadow: 0 0 30px rgba(52, 211, 153, 0.35);
}

.lc-halo {
  position: absolute;
  inset: -16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.18), transparent 70%);
  animation: haloSpin 6s linear infinite;
}

@keyframes haloSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.lc-inner {
  position: relative;
}

.lc-symbol {
  font-size: 44px;
  font-weight: 900;
  font-family: 'Consolas', monospace;
}

.logo-title {
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 6px;
  font-family: 'Consolas', monospace;
  background: linear-gradient(135deg, #67e8f9, #a78bfa, #34d399);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.logo-sub {
  font-size: 12px;
  letter-spacing: 5px;
  color: #64748b;
}

.boot-core {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 10px 34px;
}

.bc-ring {
  position: absolute;
  inset: 0;
  border-radius: 24px;
  border: 1px solid rgba(34, 211, 238, 0.35);
  animation: ringBreath 2.2s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ringBreath {
  0%, 100% { box-shadow: 0 0 12px rgba(34, 211, 238, 0.15), inset 0 0 12px rgba(34, 211, 238, 0.08); }
  50% { box-shadow: 0 0 26px rgba(34, 211, 238, 0.45), inset 0 0 20px rgba(34, 211, 238, 0.2); }
}

.bc-icon {
  font-size: 26px;
  color: #67e8f9;
  text-shadow: 0 0 16px rgba(103, 232, 249, 0.9);
}

.bc-text {
  font-size: 13px;
  letter-spacing: 4px;
  color: #a5f3fc;
  font-weight: 700;
}

.boot-core:active { transform: scale(0.96); }

.stats-summary {
  display: flex;
  gap: 14px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 14px;
  padding: 10px 22px;
}

.ss-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 52px;
}

.ss-num {
  font-size: 20px;
  font-weight: 800;
  font-family: 'Consolas', monospace;
  color: #67e8f9;
}

.ss-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.main-btns {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.mb-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  border: none;
  border-radius: 16px;
  padding: 16px 18px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.mb-btn:active { transform: scale(0.97); }

.mb-btn.primary {
  background: linear-gradient(135deg, rgba(8, 145, 178, 0.9), rgba(34, 211, 238, 0.75));
  box-shadow: 0 6px 24px rgba(34, 211, 238, 0.3);
}

.mb-btn.accent {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.85), rgba(168, 85, 247, 0.65));
  box-shadow: 0 6px 24px rgba(168, 85, 247, 0.28);
}

.mb-btn.duo {
  background: linear-gradient(135deg, rgba(190, 24, 93, 0.85), rgba(244, 114, 182, 0.65));
  box-shadow: 0 6px 24px rgba(244, 114, 182, 0.28);
}

.mb-btn.ghost {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(100, 116, 139, 0.35);
}

.mb-icon {
  font-size: 26px;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
}

.mb-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mb-title {
  font-size: 17px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2px;
}

.mb-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.bottom-nav {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: space-around;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.12);
  border-radius: 16px;
  padding: 10px 0;
}

.bn-item {
  background: none;
  border: none;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  cursor: pointer;
  padding: 4px 18px;
}

.bn-item:active { color: #67e8f9; }

.bn-icon {
  font-size: 18px;
}
</style>
