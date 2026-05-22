import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  radius: number
  alpha: number
  speed: number
  oscillationAmplitude: number
  oscillationFrequency: number
  oscillationPhase: number
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    resize()
    window.addEventListener('resize', resize)

    // Check for mobile/touch devices
    const isMobile = window.matchMedia('(pointer: coarse)').matches
    const particleCount = isMobile ? 40 : 100
    const connectionDist = 120

    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.5 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.3,
        speed: 0.2 + Math.random() * 0.4,
        oscillationAmplitude: 10 + Math.random() * 20,
        oscillationFrequency: 0.0005 + Math.random() * 0.0005,
        oscillationPhase: Math.random() * Math.PI * 2,
      })
    }

    let mouseX = -1000
    let mouseY = -1000

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', handleMouse)

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Drift upward
        p.y -= p.speed
        // Horizontal oscillation
        p.x += Math.sin(Date.now() * p.oscillationFrequency + p.oscillationPhase) * 0.3

        // Mouse repulsion
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150 * 2
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(16, 185, 129, ${p.alpha})`
        ctx.fill()
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < connectionDist) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.05 * (1 - dist / connectionDist)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
