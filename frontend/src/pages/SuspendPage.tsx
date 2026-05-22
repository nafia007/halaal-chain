import { useState } from 'react'
import { useWallet } from './contexts/WalletContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react'

export default function SuspendPage() {
  const { address, isConnecting, error: walletError, connectMetamask } = useWallet()
  const [form, setForm] = useState({
    account: '',
    amount: '',
    reason: '',
  })
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.account || !form.amount || !form.reason) {
      setStatus({ type: 'error', message: 'Account, amount, and reason are required' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(`${API_BASE}/api/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Suspend failed')
      setStatus({ type: 'success', message: `Suspended! Tx: ${data.transactionHash}` })
      // Clear form after success
      setForm({ account: '', amount: '', reason: '' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[820px] mx-auto">
        <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#10B981] mb-3">DAPPLET</div>
        <h1 className="text-white font-light tracking-tight-section mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.05 }}>
          Suspend Certification
        </h1>
        <p className="text-white/50 text-[15px] mb-10 max-w-[520px]">
          Suspend HalaalCertificationToken for an address. Requires admin privileges.
        </p>

        {!address ? (
          <Card className="glass-card border-white/[0.08]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Zap size={48} className="text-white/20 mb-6" />
              <p className="text-white/50 text-[15px] text-center mb-8 max-w-[360px]">
                Connect MetaMask to suspend certification on the Polygon PoS network.
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="glass-card border-white/[0.08]">
              <CardHeader>
                <CardTitle className="text-white font-medium">Suspend Certification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account" className="text-white/60 font-mono text-[13px]">
                    Account Address
                  </Label>
                  <Input
                    id="account"
                    type="text"
                    value={form.account}
                    onChange={handleChange}
                    placeholder="0x..."
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white/60 font-mono text-[13px]">
                    Amount (in HCT, wei)
                  </Label>
                  <Input
                    id="amount"
                    type="text"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="e.g. 1000000000000000000 for 1 HCT"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-white/60 font-mono text-[13px]">
                    Reason for suspension
                  </Label>
                  <Input
                    id="reason"
                    type="text"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="e.g. expired certificate"
                    className="w-full"
                  />
                </div>
                {status && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono ${
                    status.type === 'success' ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]' : 'bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444]'
                  }`}>
                    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{status.message}</span>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3"
                >
                  {loading ? 'Suspending…' : 'Suspend Certification'}
                </Button>
              </CardContent>
            </Card>
          </form>
        )}

        <div className="mt-8 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <p className="font-mono text-[10px] text-white/30 mb-1 uppercase tracking-[0.08em]">API Health</p>
          <p className="text-white/40 text-xs">
            Suspend endpoint: <code className="text-white/60">POST /api/suspend</code> (localhost:3001).
          </p>
        </div>
      </div>
    </div>
  )
}