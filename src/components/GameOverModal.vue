<template>
  <div class="overlay">
    <div class="modal" :class="isHumanWin ? 'win' : 'lose'">
      <div class="m-title" :class="isHumanWin ? 'win' : 'lose'">
        {{ titleText }}
      </div>
      <div class="m-sub">
        {{ subtitleText }}
      </div>

      <div v-if="pvp" class="m-score">
        <div class="ms-col" :class="{ lead: score.p1 > score.p2 }">
          <span class="msc-name">玩家 1</span>
          <span class="msc-num">{{ score.p1 }}</span>
        </div>
        <span class="msc-vs">:</span>
        <div class="ms-col" :class="{ lead: score.p2 > score.p1 }">
          <span class="msc-name">玩家 2</span>
          <span class="msc-num">{{ score.p2 }}</span>
        </div>
      </div>
      <div v-if="pvp && seriesOver" class="m-series">
        🏆 系列赛冠军：{{ score.p1 > score.p2 ? '玩家 1' : '玩家 2' }}
      </div>

      <div class="m-stats">
        <div class="ms-item">
          <span class="ms-num">{{ stats.rounds }}</span>
          <span class="ms-label">总回合数</span>
        </div>
        <div class="ms-item">
          <span class="ms-num">{{ stats.optimalMoves }}</span>
          <span class="ms-label">最优操作</span>
        </div>
        <div class="ms-item">
          <span class="ms-num">{{ stats.zeroXorMoves }}</span>
          <span class="ms-label">零异或次数</span>
        </div>
        <div class="ms-item">
          <span class="ms-num" :class="{ good: stats.score >= 60 }">{{ stats.score }}</span>
          <span class="ms-label">策略评分</span>
        </div>
      </div>
      <div class="m-duration">⏱ 用时 {{ durationText }}</div>

      <div v-if="!isHumanWin && !pvp && mistakes.length" class="m-mistakes">
        <div class="mm-title">关键错误回合</div>
        <div v-for="m in mistakes" :key="m.round" class="mm-item">
          <div class="mm-head">
            第 {{ m.round }} 回合 · 阵列 {{ letterOf(m.pileIndex) }} 移除 {{ m.remove }}
            <span class="mm-bad">失误</span>
          </div>
          <div class="mm-suggest">{{ m.suggestion }}</div>
        </div>
      </div>

      <div class="m-btns">
        <button class="btn btn-primary" @click="$emit('replay')">
          {{ pvp && seriesOver ? '再来一轮' : '再来一局' }}
        </button>
        <button class="btn btn-ghost" @click="$emit('review')">复盘</button>
        <button class="btn btn-ghost" @click="$emit('home')">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GameStats, Move } from '../types'

const props = defineProps<{
  winner: 'human' | 'ai' | 'p1' | 'p2' | null
  stats: GameStats
  history: Move[]
  pvp?: boolean
  matchScore?: { p1: number; p2: number }
}>()

defineEmits<{ replay: []; review: []; home: [] }>()

const isHumanWin = computed(() =>
  props.pvp
    ? props.winner === 'p1' || props.winner === 'p2'
    : props.winner === 'human',
)

const score = computed(() => props.matchScore ?? { p1: 0, p2: 0 })

const seriesOver = computed(() =>
  props.pvp ? score.value.p1 >= 2 || score.value.p2 >= 2 : false,
)

const winnerName = computed(() => {
  if (!props.pvp) return null
  return props.winner === 'p1' ? '玩家 1' : '玩家 2'
})

const titleText = computed(() => {
  if (props.pvp) {
    return winnerName.value ? `${winnerName.value.toUpperCase()} WINS` : ''
  }
  return isHumanWin.value ? 'SYSTEM CLEARED' : 'SYSTEM OVERRIDDEN'
})

const subtitleText = computed(() => {
  if (props.pvp) {
    return winnerName.value
      ? `${winnerName.value} 赢得了本局${seriesOver.value ? '与系列赛' : ''}`
      : ''
  }
  return isHumanWin.value
    ? '异或系统稳定 · 你赢得了这场博弈'
    : '异或系统被攻破 · AI 获胜'
})

const durationText = computed(() => {
  const s = Math.round(props.stats.durationMs / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`
})

const mistakes = computed(() =>
  props.history.filter((m) => m.player === 'human' && m.isMistake),
)
const letterOf = (i: number) => String.fromCharCode(65 + i)
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  width: min(92vw, 380px);
  max-height: 86vh;
  overflow-y: auto;
  border-radius: 20px;
  padding: 24px 20px;
  text-align: center;
  animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal.win {
  background: linear-gradient(160deg, rgba(6, 78, 59, 0.95), rgba(2, 44, 34, 0.98));
  border: 1px solid rgba(52, 211, 153, 0.5);
  box-shadow: 0 0 40px rgba(52, 211, 153, 0.25);
}

.modal.lose {
  background: linear-gradient(160deg, rgba(127, 29, 29, 0.95), rgba(40, 10, 10, 0.98));
  border: 1px solid rgba(248, 113, 113, 0.5);
  box-shadow: 0 0 40px rgba(248, 113, 113, 0.2);
}

.m-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 3px;
  font-family: 'Consolas', monospace;
}

.m-title.win { color: #34d399; text-shadow: 0 0 18px rgba(52, 211, 153, 0.8); }
.m-title.lose { color: #f87171; text-shadow: 0 0 18px rgba(248, 113, 113, 0.8); }

.m-sub {
  margin-top: 8px;
  font-size: 13px;
  color: #94a3b8;
}

.m-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-top: 14px;
}

.ms-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.ms-col.lead {
  background: rgba(255, 204, 0, 0.12);
  box-shadow: 0 0 12px rgba(255, 204, 0, 0.25);
}

.msc-name {
  font-size: 11px;
  color: #94a3b8;
}

.msc-num {
  font-size: 26px;
  font-weight: 900;
  color: #ffcc00;
  font-family: 'Consolas', monospace;
}

.msc-vs {
  font-size: 18px;
  color: #64748b;
  font-weight: 800;
}

.m-series {
  margin-top: 8px;
  font-size: 13px;
  color: #fbbf24;
  font-weight: 700;
}

.m-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 18px;
}

.ms-item {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 10px 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ms-num {
  font-size: 20px;
  font-weight: 800;
  color: #e2e8f0;
  font-family: 'Consolas', monospace;
}

.ms-num.good { color: #34d399; }

.ms-label {
  font-size: 10px;
  color: #94a3b8;
}

.m-duration {
  margin-top: 8px;
  font-size: 11px;
  color: #64748b;
}

.m-mistakes {
  margin-top: 16px;
  text-align: left;
}

.mm-title {
  font-size: 12px;
  color: #fca5a5;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.mm-item {
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.25);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 6px;
}

.mm-head {
  font-size: 12px;
  color: #fecaca;
}

.mm-bad {
  color: #f87171;
  font-size: 10px;
  border: 1px solid #f87171;
  border-radius: 4px;
  padding: 0 4px;
  margin-left: 4px;
}

.mm-suggest {
  margin-top: 4px;
  font-size: 11px;
  color: #fbbf24;
  line-height: 1.5;
}

.m-btns {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 11px 18px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
  min-height: 44px;
}

.btn:active { transform: scale(0.96); }

.btn-primary {
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #1a1400;
}

.btn-ghost {
  background: rgba(51, 65, 85, 0.6);
  color: #94a3b8;
}
</style>
