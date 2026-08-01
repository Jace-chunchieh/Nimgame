<template>
  <div class="welcome-overlay">
    <div class="welcome-modal">
      <div class="wm-logo">⊕</div>
      <h2 class="wm-title">量子异或竞技场</h2>
      <p class="wm-sub">XOR NIM · 玩法指南</p>

      <div class="wm-steps">
        <div class="ws-item">
          <span class="ws-index">1</span>
          <div class="ws-body">
            <span class="ws-title">选择能量阵列</span>
            <span class="ws-text">点击一个阵列将其选中，其他阵列会变暗。</span>
          </div>
        </div>
        <div class="ws-item">
          <span class="ws-index">2</span>
          <div class="ws-body">
            <span class="ws-title">滑动移除核心</span>
            <span class="ws-text">在阵列上左右滑动，调整要移除的核心数量，点击「确认移除」。</span>
          </div>
        </div>
        <div class="ws-item">
          <span class="ws-index">3</span>
          <div class="ws-body">
            <span class="ws-title">看懂 XOR 核心</span>
            <span class="ws-text">中央核心显示所有阵列的二进制异或结果。让 XOR = 0（系统即将稳定）就是优势局面！</span>
          </div>
        </div>
        <div class="ws-item">
          <span class="ws-index">4</span>
          <div class="ws-body">
            <span class="ws-title">获胜条件</span>
            <span class="ws-text">轮流操作，无法再进行操作的一方判负。把必败局面留给对手，你就赢了！</span>
          </div>
        </div>
      </div>

      <button class="wm-btn" @click="onStart">开始游戏</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ start: [] }>()

function onStart() {
  emit('start')
}
</script>

<style scoped>
.welcome-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.88);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: wfadeIn 0.3s ease;
  padding: 20px;
}

@keyframes wfadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.welcome-modal {
  width: min(94vw, 400px);
  max-height: 88vh;
  overflow-y: auto;
  border-radius: 22px;
  padding: 26px 22px 22px;
  text-align: center;
  background: linear-gradient(165deg, rgba(30, 26, 10, 0.97), rgba(10, 8, 2, 0.98));
  border: 1px solid rgba(255, 204, 0, 0.45);
  box-shadow: 0 0 40px rgba(255, 204, 0, 0.18);
  animation: wpopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes wpopIn {
  from { transform: scale(0.85) translateY(20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.wm-logo {
  width: 64px;
  height: 64px;
  margin: 0 auto 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  font-weight: 900;
  color: #ffcc00;
  background: radial-gradient(circle at 35% 30%, rgba(255, 204, 0, 0.25), rgba(120, 90, 0, 0.5));
  border: 2px solid #ffcc00;
  box-shadow: 0 0 24px rgba(255, 204, 0, 0.35);
  font-family: 'Consolas', monospace;
}

.wm-title {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #ffcc00, #ffb300, #ffe680);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.wm-sub {
  font-size: 12px;
  letter-spacing: 4px;
  color: #a08000;
  margin: 4px 0 16px;
}

.wm-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  margin-bottom: 18px;
}

.ws-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.ws-index {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #1a1400;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ws-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ws-title {
  font-size: 14px;
  font-weight: 700;
  color: #ffcc00;
}

.ws-text {
  font-size: 12px;
  color: #d4c68a;
  line-height: 1.6;
}

.wm-btn {
  width: 100%;
  border: none;
  border-radius: 14px;
  padding: 13px 0;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 3px;
  cursor: pointer;
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #1a1400;
  box-shadow: 0 4px 20px rgba(255, 204, 0, 0.35);
  transition: transform 0.15s ease;
}

.wm-btn:active { transform: scale(0.97); }
</style>
