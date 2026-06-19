import { useState, useEffect } from 'react'
import './App.css'

function getColor(value) {
   if (value<=50) return '#22c55e'
   if (value <= 80) return '#eab308'
  return '#ef4444'
}

function getStatusColor(status) {
  if (status === '정상') return '#22c55e'
  if (status === '점검중') return '#eab308'
  return '#ef4444'
}

function StatCard({ title, value, unit }) {
  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <p className="stat-value">{value}<span className="stat-unit">{unit}</span></p>
    <div className="progress-bg">
      <div className='progress-bar' style={{ width: `${Math.min(value, 100)}%`, background: getColor(value) }}></div>
    </div>
    </div>
  )
}

function App() {
  
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString())
  const [machines, setMachines] = useState([])
  const [metrics, setMetrics] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('전체')
  const filteredMachines = machines.filter(m => filter === '전체' || m.process_group === filter)

const filteredMetrics = filteredMachines.map(m => metrics.find(r => String(r.machine_id) === String(m.id))).filter(Boolean)

const avgUtilization = filteredMetrics.length
  ? Math.round(filteredMetrics.reduce((sum, m) => sum + m.utilization, 0) / filteredMetrics.length)
  : 0

const avgDefectRate = filteredMetrics.length
  ? (filteredMetrics.reduce((sum, m) => sum + m.defect_rate, 0) / filteredMetrics.length).toFixed(1)
  : 0

const totalProduction = filteredMetrics.reduce((sum, m) => sum + m.production_24h, 0)


  function randomize() {
    setLastUpdated(new Date().toLocaleTimeString())
  }


  useEffect(() => {
    const interval = setInterval(() => {
      randomize()
    }, 3000) 

  
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function fetchData() {
      fetch('http://localhost:3001/machines')
        .then(res => res.json())
        .then(data => setMachines(data))
  
      fetch('http://localhost:3001/metrics')
        .then(res => res.json())
        .then(data => setMetrics(data))
    }
  
    fetchData() 
    const interval = setInterval(fetchData, 5000) 
  
    return () => clearInterval(interval) 
  }, [])

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">시스템 모니터링 대시보드</h1>
      
      <div className="cards-grid">
      <StatCard title="평균 활용도" value={avgUtilization} unit="%" />
      <StatCard title="평균 불량률" value={avgDefectRate} unit="%" />
      <StatCard title="총 생산량" value={totalProduction} unit="개" />  
      </div>
      <button className="refresh-btn" onClick={randomize}>
        데이터 갱신
      </button>
      <p className='last-updated'>마지막 업데이트 : {lastUpdated}</p>

      <div className="filter-buttons">
  {['전체', 'LAM', 'STK', 'COT', 'EOL'].map(group => (
    <button key={group} onClick={() => setFilter(group)}
    className={filter === group ? 'active' : ''}
    >
      {group}
    </button>
  ))}
</div>
      <div className="machine-list">
  <h2 className="section-title">검사기 현황</h2>
  
  {machines
   .filter(machine => filter === '전체' || machine.process_group === filter)
   .map(machine => {
    const metric = metrics.find(m => m.machine_id === machine.id)
    return (
      <div key={machine.id} className="machine-row">
        <span className="machine-name" onClick={() => setSelected(machine)} >{machine.name}</span>
        <span className="machine-group">{machine.process_group}</span>
        <span className="machine-status" style={{ color: getStatusColor(machine.status) }}>
          {machine.status}
        </span>
      </div>
    )
  })}
</div>
{selected && (
  <div className="modal-overlay" onClick={() => setSelected(null)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <h2>{selected.name}</h2>
      <p>공정군: {selected.process_group}</p>
      <p>파티션: {selected.partition}</p>
      <p>제조사: {selected.manufacturer}</p>
      <p>모델명: {selected.model}</p>
      <p>설치일: {selected.installed_date}</p>
      <p>상태: {selected.status}</p>
      {(() => {
        const m = metrics.find(m => String(m.machine_id) === String(selected.id))
        return m ? (
          <>
            <p>활용도: {m.utilization}%</p>
            <p>불량률: {m.defect_rate}%</p>
            <p>생산량: {m.production_24h}</p>
          </>
        ) : null
      })()}
      <button onClick={() => setSelected(null)}>닫기</button>
    </div>
  </div>
)}

    </div>
    
    
  )
}

export default App
