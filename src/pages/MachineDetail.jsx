import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import '../App.css'

export default function MachineDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [machine, setMachine] = useState(null)
  const [metrics, setMetrics] = useState([])
  

  useEffect(() => {
    fetch(`http://localhost:3001/machines/${id}`)
      .then(res => res.json())
      .then(data => setMachine(data))

    fetch(`http://localhost:3001/metrics?machine_id=${id}`)
      .then(res => res.json())
      .then(data => setMetrics(data.sort((a, b) => a.transaction_date.localeCompare(b.transaction_date))))
  }, [id])

  if (!machine) return <div className="dashboard">로딩중...</div>

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">{machine.name}</h1>
        <button className="refresh-btn" onClick={() => navigate('/machines')}>기준정보 목록</button>
      </div>

      <div className="cards-grid">
        <div className="stat-card">
          <p className="stat-title">공정군</p>
          <p className="stat-value" style={{ fontSize: '24px' }}>{machine.process_group}</p>
        </div>
        <div className="stat-card">
          <p className="stat-title">파티션</p>
          <p className="stat-value" style={{ fontSize: '24px' }}>{machine.partition}</p>
        </div>
        <div className="stat-card">
          <p className="stat-title">상태</p>
          <p className="stat-value" style={{ fontSize: '24px', color: machine.status === '정상' ? '#22c55e' : machine.status === '점검중' ? '#eab308' : '#ef4444' }}>
            {machine.status}
          </p>
          {(() => {
            const abnormalHistory = metrics.filter(m => m.status === '점검중' || m.status === '오류')
             if (abnormalHistory.length === 0) return null
            const last = abnormalHistory[abnormalHistory.length - 1]
            return (
                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
              {last.transaction_date} — {last.status} 이력 있음
      </p>
    )
  })()}
        </div>
      </div>

      <div className="machine-list" style={{ marginTop: '24px' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>제조사: {machine.manufacturer} · 모델: {machine.model} · 설치일: {machine.installed_date} · 파티션: {machine.partition}</p>
      </div>

      <h2 className="section-title" style={{ marginTop: '32px', marginBottom: '16px' }}>활용도 추이 (%)</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={metrics}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
          <XAxis dataKey="transaction_date" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
          <Tooltip contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', color: '#f8fafc' }} />
          <Line type="monotone" dataKey="utilization" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa' }} name="활용도" />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="section-title" style={{ marginTop: '32px', marginBottom: '16px' }}>불량률 추이 (%)</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={metrics}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
          <XAxis dataKey="transaction_date" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', color: '#f8fafc' }} />
          <Line type="monotone" dataKey="defect_rate" stroke="#f87171" strokeWidth={2} dot={{ fill: '#f87171' }} name="불량률" />
        </LineChart>
      </ResponsiveContainer>

      <h2 className="section-title" style={{ marginTop: '32px', marginBottom: '16px' }}>24시간 생산량 추이</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={metrics}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
          <XAxis dataKey="transaction_date" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ background: '#1e2130', border: '1px solid #2d3148', color: '#f8fafc' }} />
          <Line type="monotone" dataKey="production_24h" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399' }} name="생산량" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}