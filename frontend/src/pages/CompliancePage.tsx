import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function CompliancePage() {
  const [form, setForm] = useState({
    from: '',
    to: '',
    amount: '',
  })
  const [result, setResult] = useState<{ compliant: boolean; from: string; to: string; amount: string } | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.from || !form.to || !form.amount) {
      setStatus({ type: 'error', message: 'From, to, and amount are required' })
      return
    }
    setLoading(true)
    setStatus(null)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/compliance?from=${encodeURIComponent(form.from)}&to=${encodeURIComponent(form.to)}&amount=${encodeURIComponent(form.amount)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Compliance check failed')
      setResult(data)
      setStatus({ type: 'success', message: 'Compliance check completed' })
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
          Transfer Compliance
        </h1>
        <p className="text-white/50 text-[15px] mb-10 max-w-[520px]">
          Check if a transfer of HalaalCertificationToken would be compliant with the contract rules.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="glass-card border-white/[0.08]">
            <CardHeader>
              <CardTitle className="text-white font-medium">Check Transfer Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from" className="text-white/60 font-mono text-[13px]">
                  From Address
                </Label>
                <Input
                  id="from"
                  type="text"
                  value={form.from}
                  onChange={handleChange}
                  placeholder="0x..."
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-white/60 font-mono text-[13px]">
                  To Address
                </Label>
                <Input
                  id="to"
                  type="text"
                  value={form.to}
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
              {status && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono ${
                  status.type === 'success' ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]' : 'bg-[#ef4444]/20 border border-[#ef4444]/40 text-[#ef4444]'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{status.message}</span>
                </div>
              )}
              {result && (
                <div className="mt-4 p-4 rounded-lg border border-white/[0.08]">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className={result.compliant ? 'text-[#10B981]' : 'text-[#ef4444]'} />
                    <span className="font-mono text-white">Transfer is {result.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</span>
                  </div>
                  <div className="text-white/40 text-[13px] font-mono space-y-1">
                    <div>From: {result.from}</div>
                    <div>To: {result.to}</div>
                    <div>Amount: {result.amount} HCT (wei)</div>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3"
              >
                {loading ? 'Checking…' : 'Check Compliance'}
              </Button>
            </CardContent>
          </Card>
        </form>

        <div className="mt-8 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <p className="font-mono text-[10px] text-white/30 mb-1 uppercase tracking-[0.08em]">API Health</p>
          <p className="text-white/40 text-xs">
            Compliance endpoint: <code className="text-white/60">GET /api/compliance</code> (localhost:3001).
          </p>
        </div>
      </div>
    </div>
  )
}