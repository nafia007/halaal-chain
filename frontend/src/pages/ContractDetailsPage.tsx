import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Globe, Link2, ShieldCheck, Hash, ExternalLink, CheckCircle2 } from 'lucide-react'

interface NetworkInfo {
  networkName: string
  chainId: number
  blockNumber: number
  contractAddress: string | null
}

export default function ContractDetailsPage() {
  const [network, setNetwork] = useState<NetworkInfo | null>(null)
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/health`).then(r => r.json()),
      fetch(`${API_BASE}/api/network`).then(r => r.json()),
      fetch(`${API_BASE}/api/token`).then(r => r.json()),
    ])
      .then(([health, net, token]: any[]) => {
        setNetwork({
          networkName: net.network || health.network || 'unknown',
          chainId: net.chainId || 0,
          blockNumber: net.blockNumber || 0,
          contractAddress: token.contractAddress || null,
        })
        setTokenInfo(token)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [API_BASE])

  const copy = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[900px] mx-auto space-y-6">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-[280px] rounded-xl" />
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[900px] mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-3">DAPPLET</div>
        <h1 className="text-white font-light tracking-tight-section mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.05 }}>
          Contract Details
        </h1>
        <p className="text-white/50 text-[15px] mb-10">
          View on-chain metadata, network status, and block height from the live Polygon PoS node.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Network card */}
          <Card className="glass-card border-white/[0.08]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Globe size={18} className="text-[#10B981]" /> Network</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Name</span>
                <span className="text-white/70">{network?.networkName}</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Chain ID</span>
                <span className="text-white/70">{network?.chainId}</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Block</span>
                <span className="text-white/70">{network?.blockNumber?.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Token card */}
          <Card className="glass-card border-white/[0.08]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Hash size={18} className="text-[#10B981]" /> HCT Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Name</span>
                <span className="text-white/70">{tokenInfo?.name || '—'}</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Symbol</span>
                <span className="text-white/70">{tokenInfo?.symbol || '—'}</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Total Supply</span>
                <span className="text-white/70">{tokenInfo?.totalSupply ? `${(Number(tokenInfo.totalSupply) / 1e18).toLocaleString()} HCT` : '—'}</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">MAX Supply</span>
                <span className="text-white/70">{tokenInfo?.maxSupply ? `${(Number(tokenInfo.maxSupply) / 1e18).toLocaleString()} HCT` : '—'}</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Owner</span>
                <button onClick={() => tokenInfo?.owner && copy(tokenInfo.owner)} className="text-white/70 hover:text-[#10B981] transition-colors flex items-center gap-1">
                  {tokenInfo?.owner ? `${tokenInfo.owner.slice(0, 6)}...${tokenInfo.owner.slice(-4)}` : '—'}
                  {copied ? <CheckCircle2 size={12} className="text-[#10B981]" /> : null}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Contract feature card */}
          <Card className="glass-card border-white/[0.08]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><ShieldCheck size={18} className="text-[#10B981]" /> Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Standard</span>
                <span className="text-white/70">ERC-20</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Decimals</span>
                <span className="text-white/70">18</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Paused</span>
                <Badge variant={tokenInfo?.paused ? 'destructive' : 'secondary'} className="font-mono text-[10px]">
                  {tokenInfo?.paused ? 'YES' : 'NO'}
                </Badge>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Solidity</span>
                <span className="text-white/70">0.8.24</span>
              </div>
            </CardContent>
          </Card>

          {/* Cross-chain card */}
          <Card className="glass-card border-white/[0.08]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white"><Link2 size={18} className="text-[#10B981]" /> Cross-Chain</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Bridge</span>
                <span className="text-white/70">LayerZero v2</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">L1 Attestor</span>
                <span className="text-white/70">MirroredCertificate</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Target</span>
                <span className="text-white/70">Ethereum / BSC</span>
              </div>
              <div className="flex justify-between font-mono text-[13px]">
                <span className="text-white/40">Endpoints</span>
                <span className="text-white/70">Deployed (Platinum → Phase 2)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Explorer link */}
        {network?.contractAddress && (
          <div className="mt-8 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <p className="font-mono text-[10px] text-white/30 mb-2 uppercase tracking-[0.08em]">PolygonScan</p>
            <div className="flex items-center gap-2 font-mono text-[13px] text-white/60">
              <span className="truncate">{network.contractAddress}</span>
              <Button size="icon" variant="ghost" className="shrink-0" onClick={() =>
                window.open(`https://polygonscan.com/address/${network.contractAddress}`, '_blank')
              }>
                <ExternalLink size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
