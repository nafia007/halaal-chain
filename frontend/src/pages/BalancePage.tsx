import { useEffect, useState } from 'react'
import { useWallet } from './contexts/WalletContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, CheckCircle2, AlertCircle, Wallet as WalletIcon } from 'lucide-react'

export default function BalancePage() {
  const { address, balance, network, isConnecting, error: walletError, connectMetamask, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)
  const [apiBal, setApiBal]   = useState<string | null>(null)
  const [apiCert, setApiCert] = useState<string | null>(null)
  const [apiSusp, setApiSusp] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

  useEffect(() => {
    if (!address) { setApiBal(null); setApiCert(null); setApiSusp(null); return }
    setApiLoading(true)
    fetch(`${API_BASE}/api/balance/${address}`)
      .then(r => r.json())
      .then(d => { setApiBal(d.balance ?? null); setApiCert(d.certifiedBalance ?? null); setApiSusp(d.suspendedBalance ?? null); setApiLoading(false) })
      .catch(() => setApiLoading(false))
  }, [address])

  const copyAddr = () => {
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }
  const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ''

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[820px] mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-3">DAPPLET</div>
        <h1 className="text-white font-light tracking-tight-section mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.05 }}>
          Wallet &amp; Balance
        </h1>
        <p className="text-white/50 text-[15px] mb-10 max-w-[520px]">
          Connect MetaMask to view your on-chain HCT balance and certified vs. suspended breakdown.
        </p>

        {!address ? (
          <Card className="glass-card border-white/[0.08]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <WalletIcon size={48} className="text-white/20 mb-6" />
              <p className="text-white/50 text-[15px] text-center mb-8 max-w-[360px]">
                Connect MetaMask to read your HCT balance from the Polygon PoS network.
              </p>
              <Button onClick={connectMetamask} disabled={isConnecting} size="lg" className="px-8 rounded-full">
                {isConnecting ? 'Connecting…' : 'Connect MetaMask'}
              </Button>
              {walletError && (
                <div className="flex items-center gap-2 mt-6 text-[#ef4444] text-sm">
                  <AlertCircle size={16} /> {walletError}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="glass-card border-white/[0.08]">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                  <span className="font-mono text-sm text-white">{short}</span>
                  <Badge variant="secondary" className="font-mono text-[10px]">{network}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyAddr} className="p-2 rounded-lg hover:bg-white/5 transition-colors" title="Copy">
                    {copied ? <CheckCircle2 size={16} className="text-[#10B981]" /> : <Copy size={16} className="text-white/40" />}
                  </button>
                  <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white font-medium">HCT Balance</CardTitle>
                <CardDescription className="text-white/40">HalaalCertificationToken on Polygon PoS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-4xl text-white tracking-tight mb-1">
                  {apiLoading ? '…' : apiBal ?? balance.slice(0, 10)}
                </div>
                <p className="text-white/30 text-xs font-mono mb-4">HCT</p>
                <div className="pt-2 border-t border-white/[0.06] space-y-0">
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-b-0">
                    <span className="font-mono text-[11px] text-white/40 tracking-wide">CERTIFIED</span>
                    <span className="text-sm font-mono text-[#10B981]">{apiCert ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                    <span className="font-mono text-[11px] text-white/40 tracking-wide">SUSPENDED</span>
                    <span className="text-sm font-mono text-white/70">{apiSusp ?? '—'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <p className="font-mono text-[10px] text-white/30 mb-1 uppercase tracking-[0.08em]">API Health</p>
          <p className="text-white/40 text-xs">
            Balance data served by <code className="text-white/60">GET /api/balance/:address</code> (localhost:3001).
          </p>
        </div>
      </div>
    </div>
  )
}
