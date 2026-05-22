import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Navigation from '../components/Navigation'
import ParticleCanvas from '../components/ParticleCanvas'
import Footer from '../components/Footer'
import Hero from '../sections/Hero'
import NetworkShowcase from '../sections/NetworkShowcase'
import GradientShowcase from '../sections/GradientShowcase'
import Architecture from '../sections/Architecture'
import TrustEcosystem from '../sections/TrustEcosystem'
import CTA from '../sections/CTA'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf as any)
    }
  }, [])

  return (
    <div className="relative bg-black min-h-screen">
      {/* Fixed particle canvas background */}
      <ParticleCanvas />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main className="relative z-[1]">
        <Hero />
        <NetworkShowcase />
        <GradientShowcase />
        <Architecture />
        <TrustEcosystem />
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
