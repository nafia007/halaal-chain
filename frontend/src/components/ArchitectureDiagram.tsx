import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const nodes = [
  { id: 'consumer', label: 'Consumer', x: 80, y: 60, r: 24, stroke: 'rgba(255,255,255,0.2)', fill: 'rgba(255,255,255,0.08)' },
  { id: 'ca', label: 'CA Portal', x: 300, y: 60, r: 24, stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.08)' },
  { id: 'mfr', label: 'Manufacturer', x: 520, y: 60, r: 24, stroke: 'rgba(255,255,255,0.2)', fill: 'rgba(255,255,255,0.08)' },
  { id: 'polygon', label: 'Polygon', x: 300, y: 220, r: 36, stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.08)', strokeWidth: 2 },
  { id: 'lz', label: 'LayerZero', x: 520, y: 220, r: 28, stroke: 'rgba(255,255,255,0.15)', fill: 'rgba(255,255,255,0.05)' },
  { id: 'hermes', label: 'Hermes', x: 300, y: 400, r: 32, stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.06)', dashed: true },
  { id: 'peers', label: 'BNB / Arbitrum / Base', x: 520, y: 400, r: 20, stroke: 'rgba(255,255,255,0.15)', fill: 'rgba(255,255,255,0.05)', multi: true },
]

const connections = [
  { from: 'consumer', to: 'polygon', stroke: 'rgba(255,255,255,0.1)', width: 1 },
  { from: 'ca', to: 'polygon', stroke: 'rgba(16, 185, 129, 0.3)', width: 2 },
  { from: 'mfr', to: 'polygon', stroke: 'rgba(255,255,255,0.1)', width: 1 },
  { from: 'polygon', to: 'lz', stroke: 'rgba(16, 185, 129, 0.25)', width: 2 },
  { from: 'lz', to: 'peers', stroke: 'rgba(255,255,255,0.08)', width: 1 },
  { from: 'hermes', to: 'polygon', stroke: 'rgba(16, 185, 129, 0.2)', width: 1, dashed: true },
  { from: 'hermes', to: 'ca', stroke: 'rgba(16, 185, 129, 0.15)', width: 1, dashed: true },
]

export default function ArchitectureDiagram() {
  const svgRef = useRef<SVGSVGElement>(null)
  const nodeRefs = useRef<Map<string, SVGGElement>>(new Map())
  const lineRefs = useRef<Map<string, SVGLineElement>>(new Map())

  useEffect(() => {
    if (!svgRef.current) return

    // Initially hide all nodes and lines
    nodeRefs.current.forEach((el) => {
      gsap.set(el, { opacity: 0, scale: 0 })
    })
    lineRefs.current.forEach((el) => {
      const length = el.getTotalLength?.() || 200
      gsap.set(el, { strokeDasharray: length, strokeDashoffset: length })
    })

    // Animate nodes and lines in sequence
    const trigger = ScrollTrigger.create({
      trigger: svgRef.current,
      start: 'top 60%',
      onEnter: () => {
        // First row of nodes
        const firstRow = ['consumer', 'ca', 'mfr']
        firstRow.forEach((id, i) => {
          const el = nodeRefs.current.get(id)
          if (el) {
            gsap.to(el, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              delay: i * 0.1,
              ease: 'back.out(1.7)',
            })
          }
        })

        // Lines to polygon
        const lines1 = connections.filter(c =>
          firstRow.includes(c.from) && c.to === 'polygon'
        )
        lines1.forEach((conn, i) => {
          const el = lineRefs.current.get(`${conn.from}-${conn.to}`)
          if (el) {
            gsap.to(el, {
              strokeDashoffset: 0,
              duration: 0.6,
              delay: 0.3 + i * 0.15,
              ease: 'power2.out',
            })
          }
        })

        // Polygon node
        setTimeout(() => {
          const poly = nodeRefs.current.get('polygon')
          if (poly) {
            gsap.to(poly, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' })
          }
        }, 600)

        // LayerZero node
        setTimeout(() => {
          const lz = nodeRefs.current.get('lz')
          if (lz) {
            gsap.to(lz, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' })
          }
          const polyLz = lineRefs.current.get('polygon-lz')
          if (polyLz) {
            gsap.to(polyLz, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' })
          }
        }, 900)

        // Peer chains
        setTimeout(() => {
          const peers = nodeRefs.current.get('peers')
          if (peers) {
            gsap.to(peers, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' })
          }
          const lzPeers = lineRefs.current.get('lz-peers')
          if (lzPeers) {
            gsap.to(lzPeers, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' })
          }
        }, 1200)

        // Hermes node and lines
        setTimeout(() => {
          const hermes = nodeRefs.current.get('hermes')
          if (hermes) {
            gsap.to(hermes, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' })
          }
          const hermesLines = connections.filter(c => c.from === 'hermes')
          hermesLines.forEach((conn) => {
            const el = lineRefs.current.get(`${conn.from}-${conn.to}`)
            if (el) {
              gsap.to(el, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' })
            }
          })
        }, 1500)
      },
      once: true,
    })

    return () => trigger.kill()
  }, [])

  const getNode = (id: string) => nodes.find(n => n.id === id)

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 480"
      className="w-full h-full"
      style={{ overflow: 'visible' }}
    >
      {/* Definitions */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection Lines */}
      {connections.map((conn) => {
        const from = getNode(conn.from)
        const to = getNode(conn.to)
        if (!from || !to) return null
        return (
          <line
            key={`${conn.from}-${conn.to}`}
            ref={(el) => {
              if (el) lineRefs.current.set(`${conn.from}-${conn.to}`, el)
            }}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={conn.stroke}
            strokeWidth={conn.width}
            strokeDasharray={conn.dashed ? '4 4' : 'none'}
          />
        )
      })}

      {/* Animated Flow Particles along key paths */}
      {connections.slice(0, 4).map((conn, ci) => {
        const from = getNode(conn.from)
        const to = getNode(conn.to)
        if (!from || !to) return null
        return (
          <g key={`particles-${ci}`}>
            {[0, 1, 2].map((pi) => (
              <circle
                key={pi}
                r={3}
                fill="#10B981"
                opacity={0.5}
              >
                <animateMotion
                  dur={`${3 + pi * 0.8}s`}
                  repeatCount="indefinite"
                  begin={`${pi * 1.2}s`}
                  path={`M${from.x},${from.y} L${to.x},${to.y}`}
                />
              </circle>
            ))}
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map((node) => (
        <g
          key={node.id}
          ref={(el) => {
            if (el) nodeRefs.current.set(node.id, el)
          }}
          transform={`translate(${node.x}, ${node.y})`}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
        >
          {node.multi ? (
            <>
              {/* Three overlapping circles for peer chains */}
              <circle cx={-12} cy={-4} r={node.r} fill={node.fill} stroke={node.stroke} strokeWidth={1} opacity={0.8} />
              <circle cx={0} cy={4} r={node.r} fill={node.fill} stroke={node.stroke} strokeWidth={1} />
              <circle cx={12} cy={-4} r={node.r} fill={node.fill} stroke={node.stroke} strokeWidth={1} opacity={0.8} />
            </>
          ) : (
            <circle
              r={node.r}
              fill={node.fill}
              stroke={node.stroke}
              strokeWidth={node.strokeWidth || 1}
              strokeDasharray={node.dashed ? '4 2' : 'none'}
            />
          )}

          {/* Node Icons */}
          {node.id === 'consumer' && (
            <svg x="-7" y="-8" width="14" height="16" viewBox="0 0 14 16" fill="rgba(255,255,255,0.5)">
              <path d="M7 0C5.5 0 4.3 1.2 4.3 2.7S5.5 5.3 7 5.3 9.7 4.1 9.7 2.7 8.5 0 7 0zM3.5 6C1.6 6 0 7.6 0 9.5V12c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V9.5C14 7.6 12.4 6 10.5 6h-7z" />
            </svg>
          )}
          {node.id === 'ca' && (
            <svg x="-7" y="-8" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#10B981" strokeWidth="1.5">
              <path d="M7 0L1 3v4c0 3.7 2.6 7.2 6 8 3.4-.8 6-4.3 6-8V3L7 0z" />
              <path d="M4.5 7L6.5 9 9.5 5" />
            </svg>
          )}
          {node.id === 'mfr' && (
            <svg x="-7" y="-8" width="14" height="14" viewBox="0 0 14 14" fill="rgba(255,255,255,0.5)">
              <path d="M0 12V6l3-2v2l3-2v2h8v6H0z" />
            </svg>
          )}
          {node.id === 'polygon' && (
            <svg x="-10" y="-10" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#10B981" strokeWidth="1.5">
              <path d="M10 1L1 6v8l9 5 9-5V6L10 1z" />
            </svg>
          )}
          {node.id === 'lz' && (
            <svg x="-7" y="-8" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
              <circle cx="4" cy="7" r="3" />
              <circle cx="10" cy="7" r="3" />
            </svg>
          )}
          {node.id === 'hermes' && (
            <svg x="-9" y="-9" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#10B981" strokeWidth="1.5">
              <circle cx="9" cy="5" r="3" />
              <path d="M2 16c0-4 3-7 7-7s7 3 7 7" />
              <circle cx="9" cy="5" r="1" fill="#10B981" />
            </svg>
          )}
          {node.id === 'peers' && (
            <text
              x="0"
              y="-28"
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
            >
              Peer Chains
            </text>
          )}

          {/* Node Label */}
          {!node.multi && (
            <text
              y={node.r + 16}
              textAnchor="middle"
              fill={node.stroke === '#10B981' ? '#10B981' : 'rgba(255,255,255,0.5)'}
              fontSize={node.id === 'polygon' ? '13' : '12'}
              fontWeight={node.id === 'polygon' ? '500' : '400'}
              fontFamily="Inter, sans-serif"
            >
              {node.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
