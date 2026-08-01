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
      :hint-index="hintIndex"
      :hint-used="game.state.hintUsed"
      :hint-limit="HINT_LIMIT"
      :can-undo="canUndo"
      :vibration="game.settings.vibration"
      @commit="onCommit"
      @exit="$emit('exit')"
      @hint="onHint"
      @undo="onUndo"
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
      :match-score="matchScore"
      @replay="restart"
      @review="showReview = true"
      @home="$emit('exit')"
    />

    <ReviewPanel
      v-if="showReview"
      :history="game.state.history"
      :initial-piles="game.initialPiles"
      @close="showReview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useGameStore, computeStats, HINT_LIMIT } from '../store/gameStore'
import { useRecordStore } from '../store/recordStore'
import { useChallengeStore, LEVELS, rateStars } from '../store/challengeStore'
import { useAchievementStore } from '../store/achievementStore'
import { sfxThink, sfxWin, sfxLose } from '../sound/sfx'
import { vibrate } from '../utils/haptics'
import GameBoard from '../components/GameBoard.vue'
import GameOverModal from '../components/GameOverModal.vue'
import ReviewPanel from '../components/ReviewPanel.vue'
import ParticleLayer from '../components/ParticleLayer.vue'
import type { GameMode } from '../types'

const props = defineProps<{ mode: GameMode; level?: number }>()
defineEmits<{ exit: [] }>()

const game = useGameStore()
const records = useRecordStore()
const challenge = useChallengeStore()
const achievements = useAchievementStore()

const aiTargetIndex = ref<number | null>(null)
const hintIndex = ref<number | null>(null)
const showReview = ref(false)
const particlesRef = ref<InstanceType<typeof ParticleLayer> | null>(null)
let aiTimer: ReturnType<typeof setTimeout> | null = null
let hintTimer: ReturnType<typeof setTimeout> | null = null
/** 双人系列赛比分（三局两胜） */
const matchScore = ref({ p1: 0, p2: 0 })

const gameReady = computed(() => game.state.piles.length > 0)
const bitWidth = computed(() =>
  Math.max(3, Math.max(...game.state.piles, 0).toString(2).length),
)
const lastStats = computed(() => game.lastStats)
const canUndo = computed(
  () =>
    props.mode !== 'pvp' &&
    game.state.status === 'player-turn' &&
    game.state.history.length > 0 &&
    game.state.history[game.state.history.length - 1].player === 'human',
)

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
  hintIndex.value = null
  showReview.value = false
  if (game.state.currentPlayer === 'ai') {
    scheduleAI()
  }
}

onMounted(() => {
  startNew()
})

onBeforeUnmount(() => {
  if (aiTimer) clearTimeout(aiTimer)
  if (hintTimer) clearTimeout(hintTimer)
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
  hintIndex.value = null
  if (game.state.status === 'game-over') {
    handleGameOver()
    return
  }
  if (props.mode !== 'pvp') {
    scheduleAI()
  }
}

function onHint() {
  const hint = game.useHint()
  if (!hint) return
  hintIndex.value = hint.pileIndex
  if (hintTimer) clearTimeout(hintTimer)
  hintTimer = setTimeout(() => {
    hintIndex.value = null
  }, 4000)
}

function onUndo() {
  if (game.undoLastMove()) {
    hintIndex.value = null
  }
}

function handleGameOver() {
  const s = game.state
  const stats = computeStats(s.history, Date.now() - s.startedAt)
  const winner = s.winner as 'human' | 'ai' | 'p1' | 'p2'
  const pvp = props.mode === 'pvp'

  achievements.checkAll({ winner, mode: props.mode, difficulty: s.difficulty, stats, level: props.level })

  if (winner === 'human' || (pvp && (winner === 'p1' || winner === 'p2'))) {
    sfxWin()
    vibrate([40, 60, 40, 60, 120])
    if (props.mode === 'challenge' && props.level) {
      challenge.completeLevel(props.level, rateStars(stats))
    }
  } else {
    sfxLose()
    vibrate([80, 40, 120])
  }

  if (pvp) {
    if (winner === 'p1') matchScore.value.p1 += 1
    else if (winner === 'p2') matchScore.value.p2 += 1
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
  // 双人系列赛结束（一方达到 2 胜）后，重新开始新一轮系列赛
  if (
    props.mode === 'pvp' &&
    (matchScore.value.p1 >= 2 || matchScore.value.p2 >= 2)
  ) {
    matchScore.value = { p1: 0, p2: 0 }
  }
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
