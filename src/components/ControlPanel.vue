<template>
  <div class="control-panel">
    <template v-if="status === 'player-turn'">
      <div v-if="selectedIndex === null" class="cp-hint" :class="{ pvp: pvp }">
        {{ hintText }}
      </div>
      <div v-else class="cp-actions">
        <div class="cp-preview">
          {{ selectedLabel }} · {{ currentCount }} → {{ afterCount }}
          <span class="cp-remove">移除 {{ previewRemove }} 个核心</span>
        </div>
        <div class="cp-btns">
          <button class="btn btn-ghost" @click="$emit('cancel')">取消</button>
          <button class="btn btn-primary" :disabled="previewRemove < 1" @click="$emit('confirm')">
            确认移除
          </button>
        </div>
      </div>
    </template>
    <template v-else-if="status === 'ai-thinking'">
      <div class="cp-ai">AI THINKING <span class="dots"><i></i><i></i><i></i></span></div>
    </template>
    <template v-else-if="status === 'ready'">
      <div class="cp-hint">准备就绪…</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
  selectedIndex: number | null
  previewRemove: number
  piles: number[]
  playerLabel?: string
  pvp?: boolean
}>()

defineEmits<{ confirm: []; cancel: [] }>()

const hintText = computed(() =>
  props.pvp
    ? `${props.playerLabel ?? ''} 回合 · 点击选择一个能量阵列，滑动调整移除数量`
    : '点击选择一个能量阵列，然后滑动调整移除数量',
)

const selectedLabel = computed(() =>
  props.selectedIndex !== null ? String.fromCharCode(65 + props.selectedIndex) : '',
)
const currentCount = computed(() =>
  props.selectedIndex !== null ? props.piles[props.selectedIndex] : 0,
)
const afterCount = computed(() => Math.max(0, currentCount.value - props.previewRemove))
</script>

<style scoped>
.control-panel {
  min-height: 76px;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 204, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cp-hint {
  color: #64748b;
  font-size: 13px;
  text-align: center;
  letter-spacing: 1px;
}

.cp-hint.pvp {
  color: #ffd966;
  font-weight: 700;
}

.cp-ai {
  color: #fbbf24;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dots i {
  display: inline-block;
  width: 4px;
  height: 4px;
  margin: 0 1px;
  border-radius: 50%;
  background: #fbbf24;
  animation: blink 0.9s infinite;
}

.dots i:nth-child(2) { animation-delay: 0.15s; }
.dots i:nth-child(3) { animation-delay: 0.3s; }

@keyframes blink {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

.cp-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cp-preview {
  text-align: center;
  font-size: 14px;
  color: #e2e8f0;
  font-weight: 600;
}

.cp-remove {
  display: block;
  color: #fbbf24;
  font-size: 12px;
  margin-top: 2px;
}

.cp-btns {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 26px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn:active { transform: scale(0.96); }

.btn-ghost {
  background: rgba(51, 65, 85, 0.6);
  color: #94a3b8;
}

.btn-primary {
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #041018;
  box-shadow: 0 4px 16px rgba(255, 204, 0, 0.35);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
