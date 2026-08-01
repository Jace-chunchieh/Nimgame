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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Home from './views/Home.vue'
import Game from './views/Game.vue'
import Tutorial from './views/Tutorial.vue'
import Challenge from './views/Challenge.vue'
import Records from './views/Records.vue'
import Settings from './views/Settings.vue'
import WelcomeModal from './components/WelcomeModal.vue'
import type { GameMode } from './types'

type View = 'home' | 'game' | 'tutorial' | 'challenge' | 'records' | 'settings'

const WELCOME_KEY = 'xor-nim:welcome-seen'

const view = ref<View>('home')
const mode = ref<GameMode>('quick')
const selectedLevel = ref(1)

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
</script>

<style scoped>
.app-shell {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh;
  padding: env(safe-area-inset-top) 14px env(safe-area-inset-bottom);
}
</style>
