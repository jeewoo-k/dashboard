import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function getColor(value) {
  if (value <= 50) return "#22c55e";
  if (value <= 80) return "#eab308";
  return "#ef4444";
}

function getStatusColor(status) {
  if (status === "정상") return "#22c55e";
  if (status === "점검중") return "#eab308";
  return "#ef4444";
}

function StatCard({ title, value, unit, max, highIsGood }) {
  const displayValue = max
    ? `${value.toLocaleString()} / ${max.toLocaleString()}`
    : value;
  const barWidth = max
    ? Math.min((value / max) * 100, 100)
    : Math.min(value, 100);

  const barColor = highIsGood
    ? barWidth >= 90
      ? "#22c55e"
      : barWidth >= 60
      ? "#eab308"
      : "#ef4444"
    : getColor(barWidth);

  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>
      <p className="stat-value" style={{ fontSize: max ? "24px" : "42px" }}>
        {displayValue}
        <span className="stat-unit">{unit}</span>
      </p>
      <div className="progress-bg">
        <div
          className="progress-bar"
          style={{ width: `${barWidth}%`, background: barColor }}
        ></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("전체");
  const [lastUpdated, setLastUpdated] = useState("-");
  const [selectedDate, setSelectedDate] = useState("");

  function fetchData() {
    fetch("http://localhost:3001/machines")
      .then((res) => res.json())
      .then((data) => setMachines(data));
    fetch("http://localhost:3001/metrics")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLastUpdated(new Date().toLocaleTimeString());
        setSelectedDate((prev) => {
          if (prev === "") return "current";
          return prev;
        });
      });
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const dates = [...new Set(metrics.map((m) => m.transaction_date))].sort();
  const filteredMachines = machines.filter(
    (m) => filter === "전체" || m.process_group === filter
  );
  const filteredMetrics = filteredMachines
    .map((m) =>
      metrics.find(
        (r) =>
          String(r.machine_id) === String(m.id) &&
          (selectedDate === "current" || r.transaction_date === selectedDate)
      )
    )
    .filter(Boolean);

  const avgUtilization = filteredMetrics.length
    ? Math.round(
        filteredMetrics.reduce((sum, m) => sum + m.utilization, 0) /
          filteredMetrics.length
      )
    : 0;
  const avgDefectRate = filteredMetrics.length
    ? (
        filteredMetrics.reduce((sum, m) => sum + m.defect_rate, 0) /
        filteredMetrics.length
      ).toFixed(1)
    : 0;
  const totalProduction = filteredMetrics.reduce(
    (sum, m) => sum + m.production_24h,
    0
  );

  const maxProduction = dates.reduce((max, date) => {
    const total = filteredMachines
      .map((m) =>
        metrics.find(
          (r) =>
            String(r.machine_id) === String(m.id) && r.transaction_date === date
        )
      )
      .filter(Boolean)
      .reduce((sum, m) => sum + m.production_24h, 0);
    return total > max ? total : max;
  }, 0);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">생산 공정별 모니터링 대시보드</h1>
        <p className="last-updated">마지막 업데이트 : {lastUpdated}</p>
      </div>

      <div className="cards-grid">
        <StatCard title="평균 활용도" value={avgUtilization} unit="%" />
        <StatCard title="평균 불량률" value={avgDefectRate} unit="%" />
        <StatCard
          title="총 생산량"
          value={totalProduction}
          unit="개"
          max={maxProduction}
          highIsGood={true}
        />
      </div>

      <div className="cards-grid" style={{ marginBottom: "16px" }}>
        {["정상", "점검중", "오류"].map((s) => {
          const count =
            selectedDate === "current"
              ? machines.filter((m) => m.status === s).length
              : metrics.filter(
                  (m) => m.transaction_date === selectedDate && m.status === s
                ).length;

          const color =
            s === "정상" ? "#22c55e" : s === "점검중" ? "#eab308" : "#ef4444";

          return (
            <div key={s} className="stat-card" style={{ padding: "14px" }}>
              <p className="stat-title">{s}</p>
              <p className="stat-value" style={{ color, fontSize: "28px" }}>
                {count}
                <span className="stat-unit">대</span>
              </p>
            </div>
          );
        })}
      </div>

      <button className="refresh-btn" onClick={fetchData}>
        데이터 갱신
      </button>

      <div className="date-filter">
        <label>날짜 선택: </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="current">전체</option>
          {dates.map((date) => (
            <option key={date}>{date}</option>
          ))}
        </select>
      </div>

      <div className="filter-buttons">
        {["전체", "LAM", "STK", "COT", "EOL"].map((group) => (
          <button
            key={group}
            onClick={() => setFilter(group)}
            className={filter === group ? "active" : ""}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="machine-list">
        <h2 className="section-title">검사기 현황</h2>
        {machines
          .filter(
            (machine) => filter === "전체" || machine.process_group === filter
          )
          .filter(
            (machine) =>
              selectedDate === "current" ||
              metrics.some(
                (r) =>
                  String(r.machine_id) === String(machine.id) &&
                  r.transaction_date === selectedDate
              )
          )
          .map((machine) => (
            <div key={machine.id} className="machine-row">
              <span
                className="machine-name"
                onClick={() => setSelected(machine)}
              >
                {machine.name}
              </span>
              <span className="machine-group">{machine.process_group}</span>
              <span
                className="machine-status"
                style={{ color: getStatusColor(machine.status) }}
              >
                {machine.status}
              </span>
            </div>
          ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selected.name}</h2>
            <p>공정군: {selected.process_group}</p>
            <p>파티션: {selected.partition}</p>
            <p>제조사: {selected.manufacturer}</p>
            <p>모델명: {selected.model}</p>
            <p>설치일: {selected.installed_date}</p>
            <p>상태: {selected.status}</p>
            {(() => {
              const m = metrics.find(
                (m) =>
                  String(m.machine_id) === String(selected.id) &&
                  m.transaction_date === selectedDate
              );
              return m ? (
                <>
                  <p>활용도: {m.utilization}%</p>
                  <p>불량률: {m.defect_rate}%</p>
                  <p>생산량: {m.production_24h}</p>
                </>
              ) : null;
            })()}
            <div className="modal-buttons">
              <button onClick={() => navigate(`/machines/${selected.id}`)}>
                상세보기
              </button>
              <button onClick={() => setSelected(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
