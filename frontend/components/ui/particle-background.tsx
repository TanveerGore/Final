'use client'

import React, { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number; y: number; originX: number; originY: number
  vx: number; vy: number; size: number; color: string
}
interface BgParticle {
  x: number; y: number; vx: number; vy: number
  size: number; alpha: number; phase: number
}

const PARTICLE_DENSITY = 0.00012
const BG_DENSITY = 0.00004
const MOUSE_RADIUS = 160
const RETURN_SPEED = 0.07
const DAMPING = 0.90
const REPULSION = 1.2

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const bgRef = useRef<BgParticle[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })
  const frameRef = useRef<number>(0)

  const init = useCallback((w: number, h: number) => {
    const count = Math.floor(w * h * PARTICLE_DENSITY)
    particlesRef.current = Array.from({ length: count }, () => {
      const x = Math.random() * w
      const y = Math.random() * h
      return { x, y, originX: x, originY: y, vx: 0, vy: 0, size: Math.random() * 1.5 + 0.5, color: Math.random() > 0.88 ? '#3b82f6' : '#ffffff' }
    })
    bgRef.current = Array.from({ length: Math.floor(w * h * BG_DENSITY) }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 1 + 0.3, alpha: Math.random() * 0.3 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [])

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width / (window.devicePixelRatio || 1)
    const H = canvas.height / (window.devicePixelRatio || 1)

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Radial glow
    const pulse = Math.sin(time * 0.0007) * 0.03 + 0.07
    const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.65)
    g.addColorStop(0, `rgba(59,130,246,${pulse})`)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // BG stars
    bgRef.current.forEach(p => {
      p.x = (p.x + p.vx + W) % W
      p.y = (p.y + p.vy + H) % H
      const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5
      ctx.globalAlpha = p.alpha * (0.3 + 0.7 * twinkle)
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'; ctx.fill()
    })
    ctx.globalAlpha = 1

    // Main particles
    const mouse = mouseRef.current
    const particles = particlesRef.current
    for (const p of particles) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (mouse.active && dist < MOUSE_RADIUS && dist > 0) {
        const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * REPULSION
        p.vx -= (dx / dist) * force * 5
        p.vy -= (dy / dist) * force * 5
      }
      p.vx += (p.originX - p.x) * RETURN_SPEED
      p.vy += (p.originY - p.y) * RETURN_SPEED
      p.vx *= DAMPING; p.vy *= DAMPING
      p.x += p.vx; p.y += p.vy
      const vel = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      const opacity = Math.min(0.25 + vel * 0.08, 0.9)
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color === '#fff' ? `rgba(255,255,255,${opacity})` : `rgba(59,130,246,${opacity})`
      ctx.fill()
    }
    frameRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current || !canvasRef.current) return
      const { width, height } = containerRef.current.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvasRef.current.width = width * dpr
      canvasRef.current.height = height * dpr
      canvasRef.current.style.width = `${width}px`
      canvasRef.current.style.height = `${height}px`
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
      init(width, height)
    }
    window.addEventListener('resize', resize)
    resize()
    return () => window.removeEventListener('resize', resize)
  }, [init])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [animate])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden bg-black"
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }
      }}
      onMouseLeave={() => { mouseRef.current.active = false }}
      style={{ pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  )
}
