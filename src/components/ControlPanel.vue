<template>
  <div class="control-panel">
    <template v-if="status === 'player-turn'">
      <div class="cp-hint" :class="{ pvp: pvp }">
        {{ hintText }}
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
  playerLabel?: string
  pvp?: boolean
}>()

const hintText = computed(() => {
  if (props.pvp) {
    return `${props.playerLabel ?? ''} 回合 · 点击阵列，横向滑动调数量，上滑或点按钮确认`
  }
  return '点击阵列，横向滑动调数量，上滑或点按钮确认'
})
</script>

<style scoped>
.control-panel {
  min-height: 56px;
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
  line-height: 1.6;
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
</style>
