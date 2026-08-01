<template>
  <div class="binary-panel" v-if="expanded" :style="{ '--bits': bitWidth }">
    <div class="bp-title">二进制位视图</div>
    <div class="bp-table">
      <div class="bp-row" v-for="(pile, i) in piles" :key="i">
        <span class="bp-name">{{ labelOf(i) }}</span>
        <span
          v-for="(bit, b) in bits"
          :key="b"
          class="bp-bit"
          :class="{ one: bit === '1' }"
        >{{ bit }}</span>
        <span class="bp-count">{{ pile }}</span>
      </div>
      <div class="bp-divider">---------------</div>
      <div class="bp-row bp-xor">
        <span class="bp-name">XOR</span>
        <span
          v-for="(bit, b) in xorBits"
          :key="b"
          class="bp-bit"
          :class="{ one: bit === '1', zero: bit === '0' }"
        >{{ bit }}</span>
        <span class="bp-count">{{ xorValue }}</span>
      </div>
    </div>
    <div class="bp-rule">奇数个 1 → 1 · 偶数个 1 → 0</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toBinary } from '../engine/xorCalculator'

const props = defineProps<{
  piles: number[]
  xorValue: number
  bitWidth: number
  expanded: boolean
}>()

const labelOf = (i: number) => String.fromCharCode(65 + i)

const bits = computed(() => props.piles.map((p) => toBinary(p, props.bitWidth)))
const xorBits = computed(() => toBinary(props.xorValue, props.bitWidth).split(''))
</script>

<style scoped>
.binary-panel {
  background: rgba(2, 6, 23, 0.85);
  border: 1px solid rgba(255, 204, 0, 0.2);
  border-radius: 14px;
  padding: 10px 12px;
}

.bp-title {
  font-size: 11px;
  color: #64748b;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.bp-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bp-row {
  display: grid;
  grid-template-columns: 34px repeat(var(--bits, 3), 1fr) 30px;
  align-items: center;
  gap: 2px;
}

.bp-name {
  font-size: 11px;
  color: #94a3b8;
}

.bp-count {
  font-size: 11px;
  color: #e2e8f0;
  text-align: right;
  font-family: 'Consolas', monospace;
}

.bp-bit {
  text-align: center;
  font-family: 'Consolas', monospace;
  font-size: 14px;
  color: #334155;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  padding: 2px 0;
}

.bp-bit.one {
  color: #ffcc00;
  background: rgba(184, 134, 11, 0.25);
}

.bp-bit.zero {
  color: #475569;
}

.bp-divider {
  color: #475569;
  font-size: 11px;
  letter-spacing: 1px;
}

.bp-xor .bp-name {
  color: #fbbf24;
  font-weight: 700;
}

.bp-xor .bp-bit.one {
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.2);
}

.bp-rule {
  margin-top: 8px;
  font-size: 10px;
  color: #64748b;
  text-align: center;
}
</style>
