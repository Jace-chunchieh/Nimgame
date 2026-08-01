<template>
  <div class="tutorial">
    <div class="page-head">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <h2>教学模式</h2>
    </div>

    <div class="tut-steps">
      <div v-for="(step, i) in steps" :key="i" class="tut-step float-in">
        <div class="ts-index">{{ i + 1 }}</div>
        <div class="ts-body">
          <div class="ts-title">{{ step.title }}</div>
          <div class="ts-text">{{ step.text }}</div>
          <div v-if="step.example" class="ts-example">{{ step.example }}</div>
        </div>
      </div>
    </div>

    <div class="tut-tip">
      <p><b>必胜口诀：</b>每次操作后让 XOR = 0，把"必败局面"留给对手。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ back: [] }>()

const steps = [
  {
    title: '基本规则',
    text: '场上有多个能量阵列，每个阵列包含若干能量核心。每回合你必须选择一个阵列，移除其中任意数量（至少 1 个）的核心。无法进行任何操作的一方判负。',
    example: '例如：阵列 A 有 5 个核心，你可以移除 1~5 个。',
  },
  {
    title: '二进制表示',
    text: '每个阵列的数量都会以二进制显示（如 5 = 101）。二进制是理解异或的基础。',
    example: '5 → 101 · 7 → 111 · 9 → 1001',
  },
  {
    title: '什么是异或（XOR）',
    text: '把所有阵列的数量按二进制逐位异或：某一位上"1 的个数是奇数"，结果为 1；是偶数，结果为 0。',
    example: '101 ⊕ 111 = 010',
  },
  {
    title: 'XOR = 0 的意义',
    text: '当所有阵列异或结果为 0 时，局面处于"稳定状态"。处于稳定状态的玩家，无论怎么操作，都会把局面破坏，让对方有反制机会。所以：让对手面对稳定状态，你就能赢。',
  },
  {
    title: '制造必胜操作',
    text: '当 XOR ≠ 0 时，存在一步操作让 XOR 归零：找出 XOR 的最高位 1，对应的列必然有奇数个 1；修改该列所属的阵列，使其变为 target = 原数量 ⊕ XOR，即可让所有位归零。',
    example: '阵列 7(111)、5(101)：XOR = 010。对 7：target = 7 ⊕ 2 = 5，移除 2 个即可。',
  },
  {
    title: '开始挑战',
    text: '在"挑战模式"中逐步练习这些技巧，最终与困难 AI 一决高下！',
  },
]
</script>

<style scoped>
.tutorial {
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

.tut-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tut-step {
  display: flex;
  gap: 12px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 204, 0, 0.12);
  border-radius: 14px;
  padding: 14px;
}

.ts-index {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #041018;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ts-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffcc00;
  margin-bottom: 5px;
}

.ts-text {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.7;
}

.ts-example {
  margin-top: 8px;
  padding: 8px 10px;
  background: rgba(255, 204, 0, 0.08);
  border-left: 3px solid #ffcc00;
  border-radius: 6px;
  font-size: 12px;
  color: #ffe9a8;
  font-family: 'Consolas', monospace;
  line-height: 1.6;
}

.tut-tip {
  margin-top: 18px;
  padding: 14px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.12), rgba(6, 78, 59, 0.4));
  border: 1px solid rgba(52, 211, 153, 0.3);
  font-size: 13px;
  color: #a7f3d0;
  line-height: 1.7;
}
</style>
