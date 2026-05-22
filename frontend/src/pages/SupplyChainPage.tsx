import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Search, CheckCircle2, XCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react'

type CertStatus = 'active' | 'suspended' | 'revoked' | 'not_found'

interface CertRecord {
  certificateId: string
  status: CertStatus
  recipient: string
  amount: string
  blockNumber: number
  txHash: string
}

const STATUS_META: Record<CertStatus, { icon: React.ReactNode; color: string; label: string }> = {
  active:         { icon: <CheckCircle2 size={14} />, color: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20', label: 'Active' },
  suspended:      { icon: <Clock size={14} />, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Suspended' },
  revoked:        { icon: <XCircle size={14} />, color: 'bg-red-500/10 text-red-400 border-red-500/20', label: 'Revoked' },
  not_found:      { icon: <AlertCircle size={14} />, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Not Found' },
}

export default function SupplyChainPage() {
  const [certId, setCertId] = useState('')
  const [records, setRecords] = useState<CertRecord[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certId.trim()) return
    setLoading(true)
    setError(null)
    setRecords(null)
    try {
      const res = await fetch(`${API_BASE}/api/verify?certificateId=${encodeURIComponent(certId.trim())}`)
      const data = await res.json()
      if (data.status === 'not_found') {
        setError(data.message || 'Certificate not found')
        setRecords([])
      } else {
        setRecords([data])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify certificate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[820px] mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-3">DAPPLET</div>
        <h1 className="text-white font-light tracking-tight-section mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.05 }}>
          Verify Certificate
        </h1>
        <p className="text-white/50 text-[15px] mb-10">
          Look up any HalalChain NFT or HCT certificate by its certificate ID. No wallet required.
        </p>

        <form onSubmit={verify} className="flex gap-3 mb-10">
          <Input
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter certificate ID (e.g. BATCH-001-2026)"
            className="font-mono bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/30 h-12"
          />
          <Button type="submit" disabled={loading || !certId.trim()} className="h-12 px-6 rounded-full shrink-0">
            <Search size={16} className="mr-2" />
            {loading ? 'Verifying…' : 'Verify'}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-500/20 bg-red-500/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-red-400 text-sm">Certificate not found</AlertTitle>
            <AlertDescription className="text-red-400/60">{error}</AlertDescription>
          </Alert>
        )}

        {records && (
          <div className="space-y-4">
            {records.map((rec) => {
              const meta = STATUS_META[rec.status]
              return (
                <Card key={rec.txHash} className="glass-card border-white/[0.08] overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base text-white font-medium flex items-center gap-2">
                        {meta.icon}
                        {rec.certificateId}
                      </CardTitle>
                      <CardDescription>HCT Certification · {meta.label}</CardDescription>
                    </div>
                    <Badge className={`font-mono text-[10px] border ${meta.color}`}>{meta.label}</Badge>
                  </CardHeader>
                  <CardContent className="text-sm font-mono space-y-2">
                    <div className="flex justify-between text-white/50">
                      <span>Recipient</span>
                      <span className="text-white/70 max-w-[240px] truncate">{rec.recipient}</span>
                    </div>
                    <Separator className="bg-white/[0.06]" />
                    <div className="flex justify-between text-white/50">
                      <span>Amount</span>
                      <span className="text-white/70">{rec.amount} HCT</span>
                    </div>
                    <Separator className="bg-white/[0.06]" />
                    <div className="flex justify-between text-white/50">
                      <span>Block</span>
                      <span className="text-white/70">{rec.blockNumber?.toLocaleString()}</span>
                    </div>
                    <Separator className="bg-white/[0.06]" />
                    <div className="flex justify-between text-white/50">
                      <span>Tx Hash</span>
                      <a
                        href={`https://polygonscan.com/tx/${rec.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#10B981] hover:underline flex items-center gap-1"
                      >
                        {rec.txHash.slice(0, 10)}…<ExternalLink size={10} />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* API tip */}
        <div className="mt-8 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <p className="font-mono text-[10px] text-white/30 mb-1 uppercase tracking-[0.08em]">API Reference</p>
          <p className="text-white/40 text-xs">
            Verification is served by <code className="text-white/60">GET /api/verify?certificateId={'{id}'}</code>.{" "}
            Events are retrieved from the smart contract via <code className="text-white/60">CertificationIssued</code>,{" "}
            <code className="text-white/60">CertificationRevoked</code>, and{" "}
            <code className="text-white/60">CertificationSuspended</code> logs.
          </p>
        </div>
      </div>
    </div>
  )
}
