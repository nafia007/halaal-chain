import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Globe, ShieldCheck, TrendingUp, Link2 } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const metrics = [
  {
    value: '300+',
    label: 'Registered certifying bodies across 60 countries',
    icon: Globe,
  },
  {
    value: '5.2M',
    label: 'Products registered on-chain with HalalChain NFT certificates',
    icon: ShieldCheck,
  },
  {
    value: '$10.2T',
    label: 'Projected Halal market size by 2030 across all segments',
    icon: TrendingUp,
  },
  {
    value: '6',
    label: 'Blockchains synchronized via LayerZero cross-chain messaging',
    icon: Link2,
  },
]

export default function NetworkShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    // Cards entrance
    cardsRef.current.forEach((card, i) => {
      if (!card) return
      gsap.set(card, { opacity: 0, y: 40 })
      const st = ScrollTrigger.create({
        trigger: card,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out',
          })

          // Count up animation
          const numEl = numberRefs.current[i]
          if (numEl) {
            const finalText = metrics[i].value
            const hasPlus = finalText.includes('+')
            const hasDollar = finalText.includes('$')
            const hasM = finalText.includes('M')
            const hasT = finalText.includes('T')
            const numericPart = parseFloat(finalText.replace(/[^0-9.]/g, ''))

            const counter = { val: 0 }
            gsap.to(counter, {
              val: numericPart,
              duration: 1.5,
              delay: i * 0.15 + 0.3,
              ease: 'power2.out',
              onUpdate: () => {
                let formatted = ''
                if (hasDollar) formatted += '$'
                if (numericPart >= 1) {
                  formatted += Math.round(counter.val).toLocaleString()
                } else {
                  formatted += counter.val.toFixed(1)
                }
                if (hasT) formatted += 'T'
                if (hasM) formatted += 'M'
                if (hasPlus) formatted += '+'
                numEl.textContent = formatted
              },
            })
          }
        },
        once: true,
      })
      triggers.push(st)
    })

    return () => {
      triggers.forEach(st => st.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black py-32 md:py-40 lg:py-48 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Eyebrow */}
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-4">
          THE NETWORK
        </div>

        {/* Title */}
        <h2 className="mb-16">
          <span
            className="block text-white font-light tracking-tight-section"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.05 }}
          >
            A universe of
          </span>
          <span
            className="block font-light tracking-tight-section text-gradient-green"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.05 }}
          >
            verification data.
          </span>
        </h2>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, i) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                ref={(el) => { cardsRef.current[i] = el }}
                className="glass-card p-10 relative"
              >
                <Icon
                  size={20}
                  className="absolute top-8 right-8 text-white/20"
                />
                <span
                  ref={(el) => { numberRefs.current[i] = el }}
                  className="block text-white font-light text-6xl md:text-7xl tracking-tight-section mb-3"
                >
                  0
                </span>
                <p className="text-white/50 text-[15px] leading-relaxed max-w-[320px]">
                  {metric.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
