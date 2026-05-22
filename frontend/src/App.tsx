import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import BalancePage from './pages/BalancePage'
import ContractDetailsPage from './pages/ContractDetailsPage'
import SupplyChainPage from './pages/SupplyChainPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/balance" element={<BalancePage />} />
      <Route path="/contract" element={<ContractDetailsPage />} />
      <Route path="/verify" element={<SupplyChainPage />} />
    </Routes>
  )
}
