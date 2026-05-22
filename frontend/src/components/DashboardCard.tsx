import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Hexagon } from 'lucide-react'

// Decorative QR code pattern (not a real QR code)
function DecorativeQR() {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,0,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0],
    [1,1,0,1,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1,0],
    [0,1,1,0,1,0,0,1,1,0,0,1,0,0,1,0,1,1,0,1],
    [1,0,1,1,0,1,1,0,0,1,0,0,1,1,0,1,0,0,1,0],
    [0,1,0,0,1,0,1,1,0,0,1,1,0,1,1,0,1,1,0,1],
    [1,0,1,1,0,1,0,0,1,1,0,1,0,0,0,1,0,1,1,0],
    [1,1,0,1,1,0,0,0,1,0,1,0,1,1,0,0,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,1,0,1,0,0],
    [1,1,1,1,1,1,1,0,0,1,1,0,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,1,0,1,1,0,0,1,0,0,0,1,0],
    [1,0,1,1,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1,0,1,0],
    [1,0,0,0,0,0,1,0,1,0,1,1,0,1,1,0,1,1,0,1],
  ]

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <rect width="120" height="120" rx="8" fill="white" />
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell === 1 ? (
            <rect
              key={`${x}-${y}`}
              x={x * 6}
              y={y * 6}
              width={5}
              height={5}
              rx={1.5}
              fill="#111"
            />
          ) : null
        )
      )}
    </svg>
  )
}

export default function DashboardCard() {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Floating animation
    const tween = gsap.to(cardRef.current, {
      y: -8,
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    return () => {
      tween.kill()
    }
  }, [])

  const dataFields = [
    { label: 'ISSUER', value: 'Emirates Authority for Standardization' },
    { label: 'PRODUCT', value: 'Al Ain Water 500ml' },
    { label: 'CHAIN', value: 'Polygon PoS', icon: <Hexagon size={12} className="text-[#10B981] inline ml-1" /> },
    { label: 'STATUS', value: 'Active', isStatus: true },
  ]

  return (
    <div
      ref={cardRef}
      className="glass-panel p-8 w-[380px] xl:w-[420px]"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
          <span className="font-mono text-[11px] text-white/50">Live Network</span>
        </div>
        <span className="font-mono text-[11px] text-white/30">12:34 UTC</span>
      </div>

      {/* Card Title */}
      <div className="text-white font-medium text-base mb-1">
        Halal Certificate #HC-2847
      </div>
      <div className="text-white/40 text-[13px] mb-6">
        ESMA Standard · Valid until 2026
      </div>

      {/* Data Fields */}
      <div>
        {dataFields.map((field) => (
          <div
            key={field.label}
            className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-b-0"
          >
            <span className="font-mono text-[11px] text-white/30 tracking-wide">
              {field.label}
            </span>
            <span className={`text-xs ${field.isStatus ? 'text-[#10B981] flex items-center gap-1.5' : 'text-white/60'}`}>
              {field.isStatus && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
              )}
              {field.value}
              {field.icon}
            </span>
          </div>
        ))}
      </div>

      {/* QR Code */}
      <div className="mt-5 pt-5 border-t border-white/[0.06]">
        <DecorativeQR />
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.08em] text-white/30 mt-3">
          Scan to Verify
        </p>
      </div>
    </div>
  )
}
