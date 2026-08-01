<template>
  <div class="app-shell">
    <Home v-if="view === 'home'" @navigate="navigate" />
    <Game
      v-else-if="view === 'game'"
      :mode="mode"
      :level="selectedLevel"
      @exit="navigate('home')"
    />
    <Tutorial v-else-if="view === 'tutorial'" @back="navigate('home')" />
    <Challenge v-else-if="view === 'challenge'" @play="playLevel" @back="navigate('home')" />
    <Records v-else-if="view === 'records'" @back="navigate('home')" />
    <Settings v-else-if="view === 'settings'" @back="navigate('home')" />

    <WelcomeModal v-if="showWelcome" @start="closeWelcome" />

    <div v-if="updateReady" class="update-toast" @click="reloadForUpdate">
      新版本已就绪，点击刷新
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import Home from './views/Home.vue'
import WelcomeModal from './components/WelcomeModal.vue'
import type { GameMode } from './types'

// 非首页视图懒加载，优化首屏
const Game = defineAsyncComponent(() => import('./views/Game.vue'))
const Tutorial = defineAsyncComponent(() => import('./views/Tutorial.vue'))
const Challenge = defineAsyncComponent(() => import('./views/Challenge.vue'))
const Records = defineAsyncComponent(() => import('./views/Records.vue'))
const Settings = defineAsyncComponent(() => import('./views/Settings.vue'))

type View = 'home' | 'game' | 'tutorial' | 'challenge' | 'records' | 'settings'

const WELCOME_KEY = 'xor-nim:welcome-seen'

const view = ref<View>('home')
const mode = ref<GameMode>('quick')
const selectedLevel = ref(1)
const updateReady = ref(false)

// 首次打开网页时展示玩法弹窗（仅一次）
const showWelcome = ref(false)
try {
  showWelcome.value = !localStorage.getItem(WELCOME_KEY)
} catch {
  showWelcome.value = true
}

function closeWelcome() {
  showWelcome.value = false
  try {
    localStorage.setItem(WELCOME_KEY, '1')
  } catch {
    /* ignore */
  }
}

function navigate(v: string) {
  if (v === 'game') {
    mode.value = 'quick'
  } else if (v === 'pvp') {
    mode.value = 'pvp'
    view.value = 'game'
    window.scrollTo(0, 0)
    return
  }
  view.value = v as View
  window.scrollTo(0, 0)
}

function playLevel(levelId: number) {
  mode.value = 'challenge'
  selectedLevel.value = levelId
  view.value = 'game'
  window.scrollTo(0, 0)
}

// Service Worker 更新提示
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            updateReady.value = true
          }
        })
      })
    })
  })
}

function reloadForUpdate() {
  updateReady.value = false
  window.location.reload()
}
</script>

<style scoped>
.app-shell {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: env(safe-area-inset-top) 14px env(safe-area-inset-bottom);
}

/* 桌面端适配：宽屏下放宽内容并横向排布阵列 */
@media (min-width: 900px) {
  .app-shell {
    max-width: 760px;
    padding: 24px 32px;
  }
}

.update-toast {
  position: fixed;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 300;
  background: linear-gradient(135deg, #b8860b, #ffcc00);
  color: #1a1400;
  font-size: 13px;
  font-weight: 800;
  padding: 12px 22px;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(255, 204, 0, 0.4);
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translate(-50%, 16px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
