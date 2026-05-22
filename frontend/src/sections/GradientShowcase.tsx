import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function GradientShowcase() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Aurora gradient canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let width = 0
    let height = 0

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        width = rect.width
        height = rect.height
        canvas.width = width
        canvas.height = height
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const bands = [
      { color: [16, 185, 129], alpha: 0.15, freq: 0.001, phase: 0, speed: 0.3 },
      { color: [5, 150, 105], alpha: 0.1, freq: 0.002, phase: Math.PI * 0.5, speed: 0.5 },
      { color: [52, 211, 153], alpha: 0.06, freq: 0.003, phase: Math.PI, speed: 0.2 },
    ]

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const time = Date.now()

      // Draw gradient bands
      for (let y = 0; y < height; y += 2) {
        let r = 0, g = 0, b = 0, totalAlpha = 0

        for (const band of bands) {
          const waveY = height / 2 + Math.sin(y * band.freq + time * band.speed * 0.001 + band.phase) * height * 0.3
          const dist = Math.abs(y - waveY)
          const bandAlpha = Math.max(0, 1 - dist / (height * 0.25)) * band.alpha

          r += band.color[0] * bandAlpha
          g += band.color[1] * bandAlpha
          b += band.color[2] * bandAlpha
          totalAlpha += bandAlpha
        }

        if (totalAlpha > 0.001) {
          ctx.fillStyle = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.min(totalAlpha, 0.3)})`
          ctx.fillRect(0, y, width, 2)
        }
      }

      // Central radial glow
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) * 0.5
      )
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.08)')
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.02)')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Scroll-triggered text reveal
  useEffect(() => {
    if (!contentRef.current) return

    gsap.set(contentRef.current, { opacity: 0, y: 30 })

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
        })
      },
      once: true,
    })

    return () => st.kill()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="products"
      className="relative w-full min-h-[80vh] overflow-hidden bg-black flex items-center justify-center"
    >
      {/* Gradient Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 text-center px-6 max-w-[800px] mx-auto"
      >
        <h2
          className="text-white font-light tracking-tight-section mb-6"
          style={{
            fontSize: 'clamp(32px, 4vw, 56px)',
            textShadow: '0 0 60px rgba(16, 185, 129, 0.3)',
            lineHeight: 1.1,
          }}
        >
          Immutable. Interoperable. Intelligent.
        </h2>

        <p className="text-white/60 text-lg leading-relaxed max-w-[640px] mx-auto mb-10">
          Every Halal certificate minted as an NFT on Polygon, synchronized across six blockchains, and monitored by Hermes — the world's first autonomous AI compliance agent for Halal certification.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a href="#developers" className="btn-secondary">
            View Architecture
          </a>
          <a href="#" className="btn-primary">
            Meet Hermes
          </a>
        </div>
      </div>
    </section>
  )
}
