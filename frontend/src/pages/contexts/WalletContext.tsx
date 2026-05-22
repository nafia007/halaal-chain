import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { BrowserProvider, formatEther } from 'ethers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WalletState = {
  address: string | null
  balance: string
  network: string
  chainId: number | null
  isConnecting: boolean
  error: string | null
}

const NETWORK_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet', 137: 'Polygon PoS', 56: 'BSC', 11155111: 'Sepolia',
}

const WalletContext = createContext<WalletState & {
  connectMetamask: () => Promise<void>
  disconnect: () => void
} | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress]           = useState<string | null>(null)
  const [balance, setBalance]           = useState('0')
  const [network, setNetwork]           = useState('')
  const [chainId, setChainId]           = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const connectMetamask = useCallback(async () => {
    // window.ethereum is injected as `any` by MetaMask's declaration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setError('MetaMask not detected. Please install MetaMask.'); return
    }
    setIsConnecting(true); setError(null)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = new BrowserProvider((window as any).ethereum)
      const accts: string[] = await provider.send('eth_requestAccounts', [])
      const net = await provider.getNetwork()
      setAddress(accts[0])
      setBalance(formatEther(await provider.getBalance(accts[0])))
      setNetwork(NETWORK_NAMES[Number(net.chainId)] || `Chain ${net.chainId}`)
      setChainId(Number(net.chainId))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally { setIsConnecting(false) }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null); setBalance('0'); setNetwork(''); setChainId(null); setError(null)
  }, [])

  return (
    <WalletContext.Provider value={{ address, balance, network, chainId, isConnecting, error, connectMetamask, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
