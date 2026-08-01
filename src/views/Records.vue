<template>
  <div class="records">
    <div class="page-head">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <h2>战绩</h2>
      <button v-if="records.records.length" class="clear-btn" @click="onClear">清空</button>
    </div>

    <div class="ach-section float-in">
      <div class="ach-head">
        <span class="ach-title">成就</span>
        <span class="ach-count">{{ achievements.unlocked.length }} / {{ ACHIEVEMENTS.length }}</span>
      </div>
      <div class="ach-grid">
        <div
          v-for="a in ACHIEVEMENTS"
          :key="a.id"
          class="ach-item"
          :class="{ locked: !achievements.isUnlocked(a.id) }"
        >
          <span class="ach-icon">{{ a.icon }}</span>
          <span class="ach-name">{{ a.name }}</span>
          <span class="ach-desc">{{ a.desc }}</span>
        </div>
      </div>
      <div class="ach-streak">
        当前连胜 <b>{{ achievements.winStreak }}</b> 场 · 累计 <b>{{ achievements.totalWins }}</b> 胜
      </div>
    </div>

    <div v-if="records.records.length === 0" class="empty">
      <div class="empty-icon">◌</div>
      <p>暂无对战记录</p>
      <p class="empty-sub">去进行一场人机对战吧</p>
    </div>

    <div v-else class="rec-list">
      <div v-for="r in records.records" :key="r.id" class="rec-item float-in">
        <div class="rec-badge" :class="badgeClass(r)">
          {{ badgeText(r) }}
        </div>
        <div class="rec-info">
          <div class="rec-top">
            <span class="rec-mode">{{ modeText(r.mode, r.level) }}</span>
            <span v-if="r.mode !== 'pvp'" class="rec-diff" :class="r.difficulty">{{ diffText(r.difficulty) }}</span>
            <span class="rec-score">{{ r.stats.score }} 分</span>
          </div>
          <div class="rec-meta">
            {{ formatDate(r.date) }} · {{ r.stats.rounds }} 回合 · 最优 {{ r.stats.optimalMoves }} · 失误 {{ r.stats.mistakes }} · {{ durationText(r.stats.durationMs) }}
          </div>
          <div class="rec-piles">
            初始：{{ r.piles.join(' / ') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRecordStore } from '../store/recordStore'
import { useAchievementStore, ACHIEVEMENTS } from '../store/achievementStore'
import type { Difficulty } from '../types'

defineEmits<{ back: [] }>()
const records = useRecordStore()
const achievements = useAchievementStore()

function durationText(ms: number) {
  const s = Math.round(ms / 1000)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m${sec}s` : `${sec}s`
}

function diffText(d: Difficulty) {
  return { easy: '简单', normal: '普通', hard: '困难' }[d]
}

function modeText(mode: string, level?: number) {
  if (mode === 'quick') return '人机对战'
  if (mode === 'pvp') return '双人对战'
  return '闯关 ' + String(level ?? '').padStart(2, '0')
}

function badgeText(r: { winner: string; mode: string }) {
  if (r.mode === 'pvp') return r.winner === 'p1' ? 'P1' : 'P2'
  return r.winner === 'human' ? '胜' : '负'
}

function badgeClass(r: { winner: string; mode: string }) {
  if (r.mode === 'pvp') return r.winner === 'p1' ? 'p1' : 'p2'
  return r.winner === 'human' ? 'win' : 'lose'
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function onClear() {
  if (confirm('确定清空全部战绩吗？')) {
    records.clearRecords()
  }
}
</script>

<style scoped>
.records {
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

.clear-btn {
  margin-left: auto;
  background: rgba(127, 29, 29, 0.5);
  border: 1px solid rgba(248, 113, 113, 0.4);
  color: #fca5a5;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
}

.page-head h2 {
  font-size: 18px;
  letter-spacing: 2px;
  color: #e2e8f0;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 80px;
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-sub {
  font-size: 12px;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rec-item {
  display: flex;
  gap: 12px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 204, 0, 0.12);
  border-radius: 14px;
  padding: 12px;
}

.rec-badge {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
}

.rec-badge.win { background: rgba(52, 211, 153, 0.15); color: #34d399; }
.rec-badge.lose { background: rgba(248, 113, 113, 0.15); color: #f87171; }
.rec-badge.p1 { background: rgba(255, 204, 0, 0.15); color: #ffcc00; }
.rec-badge.p2 { background: rgba(244, 114, 182, 0.15); color: #f472b6; }

.rec-info {
  flex: 1;
  min-width: 0;
}

.rec-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rec-mode {
  font-size: 13px;
  font-weight: 700;
  color: #e2e8f0;
}

.rec-diff {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 6px;
}

.rec-diff.easy { background: rgba(52, 211, 153, 0.15); color: #34d399; }
.rec-diff.normal { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.rec-diff.hard { background: rgba(248, 113, 113, 0.15); color: #f87171; }

.rec-score {
  margin-left: auto;
  font-size: 12px;
  color: #fbbf24;
  font-weight: 700;
}

.rec-meta {
  margin-top: 4px;
  font-size: 11px;
  color: #64748b;
}

.rec-piles {
  margin-top: 4px;
  font-size: 11px;
  color: #475569;
  font-family: 'Consolas', monospace;
}

.ach-section {
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 204, 0, 0.2);
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 12px;
}

.ach-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ach-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #ffcc00;
}

.ach-count {
  font-size: 11px;
  color: #8a7530;
  font-family: 'Consolas', monospace;
}

.ach-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.ach-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: rgba(255, 204, 0, 0.07);
  border: 1px solid rgba(255, 204, 0, 0.25);
  border-radius: 12px;
  padding: 10px 6px;
  text-align: center;
}

.ach-item.locked {
  background: rgba(51, 65, 85, 0.3);
  border-color: rgba(51, 65, 85, 0.4);
  opacity: 0.55;
}

.ach-icon {
  font-size: 22px;
}

.ach-item.locked .ach-icon {
  filter: grayscale(1);
}

.ach-name {
  font-size: 12px;
  font-weight: 700;
  color: #ffd966;
}

.ach-item.locked .ach-name {
  color: #64748b;
}

.ach-desc {
  font-size: 10px;
  color: #d4c68a;
  line-height: 1.4;
}

.ach-item.locked .ach-desc {
  color: #475569;
}

.ach-streak {
  margin-top: 10px;
  text-align: center;
  font-size: 11px;
  color: #8a7530;
}

.ach-streak b {
  color: #ffcc00;
}
</style>
