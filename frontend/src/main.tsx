import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { WalletProvider } from './pages/contexts/WalletContext.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <WalletProvider>
      <App />
    </WalletProvider>
  </BrowserRouter>,
)
