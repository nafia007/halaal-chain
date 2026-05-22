import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import DashboardCard from '../components/DashboardCard'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLDivElement>(null)
  const h1Line1Ref = useRef<HTMLDivElement>(null)
  const h1Line2Ref = useRef<HTMLDivElement>(null)
  const h1Line3Ref = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Load sequence
    const tl = gsap.timeline()

    tl.to(eyebrowRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.4,
    })
    .to(h1Line1Ref.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.4')
    .to(h1Line2Ref.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.85')
    .to(h1Line3Ref.current, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.85')
    .to(descRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.6')
    .to(ctaRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.4')
    .to(cardRef.current, {
      opacity: 1,
      x: 0,
      duration: 1.2,
      ease: 'power3.out',
    }, '-=0.8')

    // Hero scroll shrink effect
    if (sectionRef.current) {
      gsap.to(sectionRef.current, {
        scale: 0.95,
        borderRadius: '24px',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === sectionRef.current) st.kill()
      })
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="network"
      className="relative w-full min-h-[100dvh] overflow-hidden bg-black"
    >
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center min-h-[100dvh] px-6 md:px-12 lg:px-20">
        <div className="w-full max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          {/* Text Content */}
          <div className="flex-1 max-w-[640px]">
            {/* Eyebrow */}
            <div
              ref={eyebrowRef}
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-6 opacity-0 translate-y-2.5"
            >
              HALALCHAIN PROTOCOL
            </div>

            {/* Headline */}
            <h1 className="mb-0">
              <div
                ref={h1Line1Ref}
                className="text-white font-light tracking-tight-display opacity-0 translate-y-8"
                style={{ fontSize: 'clamp(48px, 8vw, 140px)', lineHeight: 0.9 }}
              >
                Decentralized
              </div>
              <div
                ref={h1Line2Ref}
                className="text-white font-light tracking-tight-display opacity-0 translate-y-8"
                style={{ fontSize: 'clamp(48px, 8vw, 140px)', lineHeight: 0.9 }}
              >
                Trust Layer
              </div>
              <div
                ref={h1Line3Ref}
                className="text-white/50 font-light tracking-tight-display opacity-0 translate-y-8"
                style={{ fontSize: 'clamp(48px, 8vw, 140px)', lineHeight: 0.9 }}
              >
                for a $2.3T Market
              </div>
            </h1>

            {/* Description */}
            <p
              ref={descRef}
              className="mt-8 text-lg text-white/60 leading-relaxed max-w-[480px] opacity-0 translate-y-5"
            >
              HalalChain digitizes and globalizes Halal certification across 300+ certifying bodies. NFT licenses on Polygon, synchronized across six blockchains via LayerZero, powered by Hermes — our autonomous AI compliance agent.
            </p>

            {/* CTA Buttons */}
            <div
              ref={ctaRef}
              className="flex flex-wrap gap-4 mt-10 opacity-0 translate-y-4"
            >
              <a href="#" className="btn-primary">
                Explore the Network
              </a>
              <a href="#" className="btn-secondary">
                Read Documentation
              </a>
            </div>
          </div>

          {/* Floating Dashboard Card */}
          <div
            ref={cardRef}
            className="hidden lg:block flex-shrink-0 opacity-0 translate-x-[60px]"
            style={{
              perspective: '1000px',
            }}
          >
            <div
              style={{
                transform: 'rotateY(-5deg) rotateX(2deg)',
                transformStyle: 'preserve-3d',
              }}
            >
              <DashboardCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
