<template>
  <div class="challenge">
    <div class="page-head">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <h2>挑战模式</h2>
    </div>

    <div class="lv-steps">
      <div
        v-for="lv in LEVELS"
        :key="lv.id"
        class="lv-item"
        :class="{
          locked: !challenge.isUnlocked(lv.id),
          current: challenge.isUnlocked(lv.id) && lv.id === challenge.progress.unlocked,
        }"
        @click="onClickLevel(lv.id)"
      >
        <div class="lv-badge">
          <span v-if="challenge.isUnlocked(lv.id)" class="lv-num">{{ String(lv.id).padStart(2, '0') }}</span>
          <span v-else class="lv-lock">🔒</span>
        </div>
        <div class="lv-info">
          <div class="lv-name">
            {{ lv.name }}
            <span v-if="challenge.starsOf(lv.id) > 0" class="lv-stars">
              {{ '★'.repeat(challenge.starsOf(lv.id)) }}<span class="lv-stars-dim">{{ '★'.repeat(3 - challenge.starsOf(lv.id)) }}</span>
            </span>
          </div>
          <div class="lv-diff" :class="lv.difficulty">{{ diffText(lv.difficulty) }}</div>
        </div>
        <div class="lv-piles">
          <span v-for="(p, i) in lv.piles" :key="i" class="lv-pile">{{ p }}</span>
        </div>
      </div>
    </div>

    <div class="lv-tip">
      完成第 {{ challenge.progress.unlocked - 1 }} 关后解锁下一关。按最优操作比例评定 1~3 星，通关后仍可重打刷星。
    </div>
  </div>
</template>

<script setup lang="ts">
import { LEVELS, useChallengeStore } from '../store/challengeStore'
import type { Difficulty } from '../types'

const emit = defineEmits<{ play: [level: number]; back: [] }>()
const challenge = useChallengeStore()

function diffText(d: Difficulty) {
  return { easy: '简单', normal: '普通', hard: '困难' }[d]
}

function onClickLevel(id: number) {
  if (challenge.isUnlocked(id)) {
    emit('play', id)
  }
}
</script>

<style scoped>
.challenge {
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

.lv-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lv-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 204, 0, 0.15);
  border-radius: 14px;
  padding: 12px 14px;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.lv-item:active { transform: scale(0.98); }

.lv-item.locked {
  opacity: 0.45;
  cursor: not-allowed;
}

.lv-item.current {
  border-color: rgba(255, 204, 0, 0.7);
  box-shadow: 0 0 14px rgba(255, 204, 0, 0.2);
}

.lv-badge {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(184, 134, 11, 0.8), rgba(255, 204, 0, 0.6));
  font-family: 'Consolas', monospace;
  font-size: 17px;
  font-weight: 800;
  color: #041018;
}

.lv-item.locked .lv-badge {
  background: rgba(51, 65, 85, 0.6);
}

.lv-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.lv-name {
  font-size: 15px;
  font-weight: 700;
  color: #e2e8f0;
}

.lv-stars {
  font-size: 12px;
  color: #ffcc00;
  margin-left: 4px;
  letter-spacing: 1px;
}

.lv-stars-dim {
  color: #334155;
}

.lv-diff {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 8px;
  width: fit-content;
}

.lv-diff.easy { background: rgba(52, 211, 153, 0.15); color: #34d399; }
.lv-diff.normal { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
.lv-diff.hard { background: rgba(248, 113, 113, 0.15); color: #f87171; }

.lv-piles {
  display: flex;
  gap: 4px;
}

.lv-pile {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(255, 204, 0, 0.12);
  color: #ffcc00;
  font-family: 'Consolas', monospace;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lv-tip {
  margin-top: 16px;
  font-size: 11px;
  color: #64748b;
  text-align: center;
  line-height: 1.6;
}
</style>
