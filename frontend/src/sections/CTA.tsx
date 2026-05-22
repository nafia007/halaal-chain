import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    gsap.set(contentRef.current, { opacity: 0, y: 40 })

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 60%',
      onEnter: () => {
        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 1.2,
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
      className="relative w-full min-h-[100dvh] overflow-hidden flex items-center justify-center"
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/cta-bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 text-center px-6 max-w-[700px] mx-auto"
      >
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/50 mb-6">
          JOIN THE NETWORK
        </div>

        <h2
          className="font-light tracking-tight-section mb-4"
          style={{ fontSize: 'clamp(40px, 6vw, 88px)', lineHeight: 1.05 }}
        >
          <span className="block text-white">Start building</span>
          <span className="block text-gradient-green-light shimmer-text">
            on HalalChain.
          </span>
        </h2>

        <p className="text-white/60 text-lg max-w-[560px] mx-auto mb-12">
          Whether you're a certifying authority, manufacturer, retailer, or developer — HalalChain provides the infrastructure to verify, certify, and trust.
        </p>

        <div className="flex flex-wrap justify-center gap-5">
          <a
            href="#"
            className="inline-flex items-center justify-center px-10 py-4 rounded-full font-medium text-[15px] transition-all duration-300 bg-[#10B981] text-black hover:bg-[#34D399] hover:shadow-[0_0_32px_rgba(16,185,129,0.4)]"
          >
            Launch App
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center px-10 py-4 rounded-full font-medium text-[15px] transition-all duration-300 border border-white/25 text-white hover:border-white hover:bg-white/5"
          >
            Read the Docs
          </a>
        </div>
      </div>
    </section>
  )
}
