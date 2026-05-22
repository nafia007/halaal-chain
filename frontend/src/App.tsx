import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import BalancePage from './pages/BalancePage'
import ContractDetailsPage from './pages/ContractDetailsPage'
import SupplyChainPage from './pages/SupplyChainPage'
import IssuePage from './pages/IssuePage'
import SuspendPage from './pages/SuspendPage'
import CompliancePage from './pages/CompliancePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/balance" element={<BalancePage />} />
      <Route path="/contract" element={<ContractDetailsPage />} />
      <Route path="/verify" element={<SupplyChainPage />} />
      <Route path="/issue" element={<IssuePage />} />
      <Route path="/suspend" element={<SuspendPage />} />
      <Route path="/compliance" element={<CompliancePage />} />
    </Routes>
  )
}
