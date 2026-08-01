<template>
  <canvas ref="canvasRef" class="particle-layer"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  gravity: number
}

const props = defineProps<{
  x?: number
  y?: number
  color?: string
  count?: number
  spread?: number
  reduced?: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let raf = 0
let running = false
let particles: Particle[] = []
/** 低性能模式（prefers-reduced-motion 或设置开启）下减少粒子数量 */
const maxParticles = props.reduced ? 40 : 150

function resize() {
  const c = canvasRef.value
  if (!c) return
  const parent = c.parentElement
  if (!parent) return
  c.width = parent.clientWidth
  c.height = parent.clientHeight
}

function spawnBurst(cx?: number, cy?: number) {
  const c = canvasRef.value
  if (!c) return
  const centerX = cx ?? props.x ?? c.width / 2
  const centerY = cy ?? props.y ?? c.height / 2
  const count = Math.min(props.count ?? 40, maxParticles - particles.length)
  const colors = props.color
    ? [props.color]
    : ['#ffcc00', '#34d399', '#fbbf24', '#f87171', '#a78bfa']
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 1.5 + Math.random() * 4
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 0,
      maxLife: 40 + Math.random() * 40,
      size: 1.5 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.05,
    })
  }
  if (!running) startLoop()
}

function tick() {
  if (!ctx) return
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  particles = particles.filter((p) => p.life < p.maxLife)
  for (const p of particles) {
    p.life++
    p.x += p.vx
    p.y += p.vy
    p.vy += p.gravity
    p.vx *= 0.98
    const alpha = 1 - p.life / p.maxLife
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * alpha + 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  if (particles.length > 0) {
    raf = requestAnimationFrame(tick)
  } else {
    running = false
  }
}

function startLoop() {
  if (running) return
  running = true
  raf = requestAnimationFrame(tick)
}

function onBurstEvent(e: Event) {
  const d = (e as CustomEvent).detail as { x: number; y: number } | undefined
  if (d) spawnBurst(d.x, d.y)
}

onMounted(() => {
  resize()
  ctx = canvasRef.value?.getContext('2d') ?? null
  window.addEventListener('resize', resize)
  canvasRef.value?.addEventListener('particle-burst', onBurstEvent)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  running = false
  window.removeEventListener('resize', resize)
  canvasRef.value?.removeEventListener('particle-burst', onBurstEvent)
})

function fire(x?: number, y?: number, color?: string) {
  spawnBurst(x, y)
  void color
}

defineExpose({ fire })
</script>

<style scoped>
.particle-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}
</style>
