import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const logos = [
  'JAKIM', 'SANHA', 'ESMA', 'IFANCA', 'MUI', 'GSO', 'BPJPH', 'HFCE', 'HFA',
]

// Generate unique subtle gradient for each logo cell
function getLogoGradient(index: number) {
  const hues = [
    ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
    ['rgba(16,185,129,0.06)', 'rgba(255,255,255,0.02)'],
    ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)'],
    ['rgba(255,255,255,0.05)', 'rgba(16,185,129,0.03)'],
    ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)'],
    ['rgba(16,185,129,0.05)', 'rgba(255,255,255,0.02)'],
    ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)'],
    ['rgba(255,255,255,0.08)', 'rgba(16,185,129,0.02)'],
    ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'],
  ]
  const [from, to] = hues[index % hues.length]
  return `linear-gradient(135deg, ${from}, ${to})`
}

export default function TrustEcosystem() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cellsRef = useRef<(HTMLDivElement | null)[]>([])
  const quoteRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const triggers: ScrollTrigger[] = []

    cellsRef.current.forEach((cell, i) => {
      if (!cell) return

      gsap.set(cell, { opacity: 0, scale: 0.95 })

      const st = ScrollTrigger.create({
        trigger: cell,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(cell, {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: i * 0.12,
            ease: 'power3.out',
          })

          // Sparkle effect - create sparkle elements
          const sparkleCount = 8
          for (let s = 0; s < sparkleCount; s++) {
            const sparkle = document.createElement('div')
            const isCross = Math.random() > 0.5
            sparkle.innerHTML = isCross ? '+' : '\u00d7'
            sparkle.style.cssText = `
              position: absolute;
              color: #10B981;
              font-size: ${8 + Math.random() * 8}px;
              font-family: monospace;
              font-weight: bold;
              pointer-events: none;
              opacity: 0;
              left: ${10 + Math.random() * 80}%;
              top: ${10 + Math.random() * 80}%;
              z-index: 10;
            `
            cell.appendChild(sparkle)

            gsap.to(sparkle, {
              opacity: 1,
              scale: 1.5,
              duration: 0.2,
              delay: i * 0.12 + Math.random() * 0.4,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to(sparkle, {
                  opacity: 0,
                  scale: 0.5,
                  y: -20,
                  duration: 0.3,
                  ease: 'power2.in',
                  onComplete: () => sparkle.remove(),
                })
              },
            })
          }
        },
        once: true,
      })
      triggers.push(st)
    })

    // Quote reveal
    if (quoteRef.current) {
      gsap.set(quoteRef.current, { opacity: 0, y: 30 })
      const st = ScrollTrigger.create({
        trigger: quoteRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(quoteRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
          })
        },
        once: true,
      })
      triggers.push(st)
    }

    return () => triggers.forEach(st => st.kill())
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full bg-[#0A0A0A] py-28 md:py-36 px-6 md:px-12 lg:px-20"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Eyebrow */}
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-4">
          TRUSTED ACROSS THE ECOSYSTEM
        </div>

        {/* Headline */}
        <h2
          className="text-white font-light tracking-tight-section mb-16 md:mb-20 max-w-[700px]"
          style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}
        >
          Recognized by leading certifying authorities worldwide
        </h2>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          {logos.map((logo, i) => (
            <div
              key={logo}
              ref={(el) => { cellsRef.current[i] = el }}
              className="relative h-[100px] rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {/* Logo placeholder */}
              <div
                className="w-[120px] h-[36px] rounded-md"
                style={{ background: getLogoGradient(i) }}
              />
              <span className="text-white/30 text-xs font-normal">{logo}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div ref={quoteRef} className="mt-20 md:mt-28 max-w-[720px] mx-auto text-center">
          <div
            className="text-[120px] leading-[0.5] text-[#10B981]/15 font-light select-none"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            &ldquo;
          </div>
          <blockquote className="text-white/80 text-lg md:text-[22px] font-light italic leading-relaxed -mt-4">
            HalalChain represents exactly the kind of transparent, auditable infrastructure the Halal certification industry has needed for decades. The ability to verify certificates in real-time across multiple jurisdictions is a paradigm shift.
          </blockquote>
          <cite className="block mt-6 not-italic text-white/40 text-sm">
            — Dr. Aisha Rahman, Certification Director, SANHA South Africa
          </cite>
        </div>
      </div>
    </section>
  )
}
