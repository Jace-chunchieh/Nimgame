<template>
  <div class="game-view">
    <GameBoard
      v-if="gameReady"
      :piles="game.state.piles"
      :status="game.state.status"
      :round="game.state.round"
      :current-player="game.state.currentPlayer"
      :difficulty="game.state.difficulty"
      :ai-target-index="aiTargetIndex"
      :bit-width="bitWidth"
      :pvp="props.mode === 'pvp'"
      @commit="onCommit"
      @exit="$emit('exit')"
    />

    <ParticleLayer
      ref="particlesRef"
      :reduced="game.settings.lowPower"
    />

    <GameOverModal
      v-if="game.state.status === 'game-over' && lastStats"
      :winner="game.state.winner as 'human' | 'ai' | 'p1' | 'p2'"
      :stats="lastStats"
      :history="game.state.history"
      :pvp="props.mode === 'pvp'"
      @replay="restart"
      @home="$emit('exit')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useGameStore, computeStats } from '../store/gameStore'
import { useRecordStore } from '../store/recordStore'
import { useChallengeStore, LEVELS } from '../store/challengeStore'
import { sfxThink, sfxWin, sfxLose } from '../sound/sfx'
import { vibrate } from '../utils/haptics'
import GameBoard from '../components/GameBoard.vue'
import GameOverModal from '../components/GameOverModal.vue'
import ParticleLayer from '../components/ParticleLayer.vue'
import type { GameMode } from '../types'

const props = defineProps<{ mode: GameMode; level?: number }>()
defineEmits<{ exit: [] }>()

const game = useGameStore()
const records = useRecordStore()
const challenge = useChallengeStore()

const aiTargetIndex = ref<number | null>(null)
const particlesRef = ref<InstanceType<typeof ParticleLayer> | null>(null)
let aiTimer: ReturnType<typeof setTimeout> | null = null

const gameReady = computed(() => game.state.piles.length > 0)
const bitWidth = computed(() =>
  Math.max(3, Math.max(...game.state.piles, 0).toString(2).length),
)
const lastStats = computed(() => game.lastStats)

function startNew() {
  if (props.mode === 'challenge' && props.level) {
    const lv = LEVELS.find((l) => l.id === props.level) ?? LEVELS[0]
    game.newGame({
      piles: [...lv.piles],
      difficulty: lv.difficulty,
      humanFirst: lv.humanFirst,
      gameMode: 'challenge',
      level: lv.id,
    })
  } else {
    game.newGame({ gameMode: props.mode === 'pvp' ? 'pvp' : 'quick' })
  }
  aiTargetIndex.value = null
  if (game.state.currentPlayer === 'ai') {
    scheduleAI()
  }
}

onMounted(() => {
  startNew()
})

onBeforeUnmount(() => {
  if (aiTimer) clearTimeout(aiTimer)
})

function scheduleAI() {
  sfxThink()
  const thinkTime = game.settings.lowPower ? 350 : 500 + Math.random() * 400
  aiTimer = setTimeout(() => {
    aiTimer = null
    game.aiMove()
    const last = game.state.history[game.state.history.length - 1]
    if (last) aiTargetIndex.value = last.pileIndex
    setTimeout(() => {
      aiTargetIndex.value = null
    }, 900)
    if (game.state.status === 'ai-thinking') {
      scheduleAI()
    }
  }, thinkTime)
}

function onCommit(index: number, remove: number) {
  const ok = game.playerMove(index, remove)
  if (!ok) return
  if (game.state.status === 'game-over') {
    handleGameOver()
    return
  }
  if (props.mode !== 'pvp') {
    scheduleAI()
  }
}

function handleGameOver() {
  const s = game.state
  const stats = computeStats(s.history)
  const winner = s.winner as 'human' | 'ai' | 'p1' | 'p2'
  const pvp = props.mode === 'pvp'
  if (winner === 'human' || (pvp && (winner === 'p1' || winner === 'p2'))) {
    sfxWin()
    vibrate([40, 60, 40, 60, 120])
    if (props.mode === 'challenge' && props.level) {
      challenge.completeLevel(props.level)
    }
  } else {
    sfxLose()
    vibrate([80, 40, 120])
  }
  records.addRecord({
    id: `${Date.now()}`,
    date: Date.now(),
    mode: props.mode,
    difficulty: s.difficulty,
    level: props.mode === 'challenge' ? props.level : undefined,
    piles: [...game.initialPiles],
    winner,
    humanFirst: s.humanFirst,
    stats,
  })
  particlesRef.value?.fire()
}

function restart() {
  startNew()
}
</script>

<style scoped>
.game-view {
  position: relative;
  min-height: 100dvh;
  padding-bottom: 10px;
}
</style>
