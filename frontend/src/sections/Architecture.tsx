import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ArchitectureDiagram from '../components/ArchitectureDiagram'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: '01',
    title: 'Application Layer',
    desc: "Five purpose-built interfaces — CA Portal, Manufacturer Dashboard, Consumer Verify PWA, Retailer API, and Admin Console. Each stakeholder interacts with a unified on-chain source of truth through their own tailored experience.",
    tags: ['Next.js 14', 'React Native', 'RainbowKit', 'wagmi'],
  },
  {
    num: '02',
    title: 'Protocol Layer',
    desc: 'Smart contracts on Polygon PoS: HalalLicense (ERC-721), HalalRegistry (ERC-1155), HalalOApp (LayerZero v2), CertifyingAuthority, Governance, and Treasury. Immutable certificate records with timelock-governed upgrades.',
    tags: ['Solidity', 'ERC-721', 'ERC-1155', 'UUPS Proxy'],
  },
  {
    num: '03',
    title: 'Infrastructure Layer',
    desc: 'Polygon PoS as the home chain, LayerZero v2 for trustless cross-chain messaging, IPFS + Filecoin for decentralized audit document storage, The Graph for indexed querying, PostgreSQL + Redis for off-chain operations, and Hermes AI for autonomous compliance.',
    tags: ['Polygon PoS', 'LayerZero v2', 'IPFS', 'The Graph'],
  },
  {
    num: '04',
    title: 'Hermes AI Agent',
    desc: 'An autonomous LLM-powered compliance agent built on LangGraph. Hermes handles document OCR and parsing across 12 languages, ingredient classification against 40,000+ substances, on-chain anomaly detection, expiry tracking, regulatory monitoring, and serves a natural-language consumer chatbot — all with human oversight for critical decisions.',
    tags: ['LangGraph', 'Claude', 'pgvector', 'Fly.io'],
  },
]

export default function Architecture() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stickyContainerRef = useRef<HTMLDivElement>(null)
  const leftColRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current || !stickyContainerRef.current) return

    // Pin the section
    const st = ScrollTrigger.create({
      trigger: stickyContainerRef.current,
      start: 'top 20%',
      end: '+=2500',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress

        // Progress line fill
        if (progressRef.current) {
          progressRef.current.style.height = `${progress * 100}%`
        }

        // Activate steps based on progress
        const stepIndex = Math.min(3, Math.floor(progress * 4))
        stepRefs.current.forEach((step, i) => {
          if (!step) return
          const dot = step.querySelector('.step-dot') as HTMLElement
          const title = step.querySelector('.step-title') as HTMLElement
          if (i <= stepIndex) {
            title?.classList.add('text-[#10B981]')
            title?.classList.remove('text-white')
            if (dot) {
              dot.style.backgroundColor = '#10B981'
              dot.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.5)'
            }
          } else {
            title?.classList.remove('text-[#10B981]')
            title?.classList.add('text-white')
            if (dot) {
              dot.style.backgroundColor = 'rgba(255,255,255,0.15)'
              dot.style.boxShadow = 'none'
            }
          }
        })
      },
    })

    return () => st.kill()
  }, [])

  return (
    <section ref={sectionRef} id="developers" className="relative w-full bg-black">
      {/* Title Block */}
      <div className="px-6 md:px-12 lg:px-20 pt-28 md:pt-36 pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-4">
            INFRASTRUCTURE
          </div>
          <h2
            className="text-white font-light tracking-tight-section mb-4"
            style={{ fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1.05 }}
          >
            Three Layers of Trust
          </h2>
          <p className="text-white/50 text-lg max-w-[560px]">
            From on-chain certificates to cross-chain synchronization to AI-powered compliance.
          </p>
        </div>
      </div>

      {/* Sticky Layout */}
      <div
        ref={stickyContainerRef}
        className="relative px-6 md:px-12 lg:px-20"
      >
        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left Column - Steps */}
          <div ref={leftColRef} className="lg:w-[40%] relative">
            {/* Progress Line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-white/10 hidden lg:block">
              <div
                ref={progressRef}
                className="w-full bg-[#10B981]/30 transition-all duration-100"
                style={{ height: '0%' }}
              />
            </div>

            <div className="flex flex-col gap-10 lg:gap-14">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  ref={(el) => { stepRefs.current[i] = el }}
                  className="relative pl-0 lg:pl-10"
                >
                  {/* Step Dot */}
                  <div
                    className="step-dot absolute left-0 top-1 w-[22px] h-[22px] rounded-full border-2 border-white/10 hidden lg:flex items-center justify-center transition-all duration-500"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  {/* Step Number */}
                  <div className="font-mono text-5xl text-[#10B981]/20 mb-2">
                    {step.num}
                  </div>

                  {/* Step Title */}
                  <h3 className="step-title text-white font-medium text-2xl mb-3 transition-colors duration-500">
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="text-white/50 text-[15px] leading-relaxed mb-4">
                    {step.desc}
                  </p>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2">
                    {step.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[11px] text-white/40 px-3 py-1 rounded-md bg-white/[0.05] border border-white/[0.08]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - SVG Diagram */}
          <div className="lg:w-[60%] hidden lg:block">
            <div className="sticky top-[20%] h-[60vh]">
              <ArchitectureDiagram />
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for scroll room */}
      <div className="h-[300px] lg:h-[500px]" />
    </section>
  )
}
