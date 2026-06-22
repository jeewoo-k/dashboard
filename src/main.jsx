import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import MachineList from './pages/MachineList.jsx'
import MachineDetail from './pages/MachineDetail.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/machines" element={<MachineList />} />
        <Route path="/machines/:id" element={<MachineDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)