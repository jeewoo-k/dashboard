import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const COLUMNS = [
  { key: "name", label: "검사기명" },
  { key: "process_group", label: "공정군" },
  { key: "partition", label: "설비위치" },
  { key: "manufacturer", label: "업체" },
  { key: "model", label: "모델" },
  { key: "installed_date", label: "도입날짜" },
  { key: "status", label: "상태" },
];

export default function MachineList() {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [filter, setFilter] = useState("전체");
  const [partitionFilter, setPartitionFilter] = useState("설비위치");
  const [manufacturerFilter, setManufacturerFilter] = useState("업체");
  const [dateFilter, setDateFilter] = useState("도입날짜");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetch("http://localhost:3001/machines")
      .then((res) => res.json())
      .then((data) => setMachines(data));
  }, []);

  const STATUS_ORDER = { 정상: 0, 점검중: 1, 오류: 2 };

  function handleSort(key) {
    if (sortKey === key) {
      if (sortDir === "desc") {
        setSortKey(null);
        setSortDir("asc");
      } else {
        setSortDir("desc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filteredByGroup =
    filter === "전체"
      ? machines
      : machines.filter((m) => m.process_group === filter);

  const partitions = [
    "설비위치",
    ...new Set(filteredByGroup.map((m) => m.partition)),
  ];
  const manufacturers = [
    "업체",
    ...new Set(filteredByGroup
      .filter(m => partitionFilter === "설비위치" || m.partition === partitionFilter)
      .map((m) => m.manufacturer)),
  ];
  const filteredForDate = filteredByGroup
    .filter(
      (m) => partitionFilter === "설비위치" || m.partition === partitionFilter
    )
    .filter(
      (m) =>
        manufacturerFilter === "업체" || m.manufacturer === manufacturerFilter
    );

  const installedDates = [
    "도입날짜",
    ...new Set(filteredForDate.map((m) => m.installed_date)),
  ].sort((a, b) => {
    if (a === "도입날짜") return -1;
    if (b === "도입날짜") return 1;
    return a.localeCompare(b);
  });

  const displayed = machines
    .filter((m) => filter === "전체" || m.process_group === filter)
    .filter(
      (m) => partitionFilter === "설비위치" || m.partition === partitionFilter
    )
    .filter(
      (m) =>
        manufacturerFilter === "업체" || m.manufacturer === manufacturerFilter
    )
    .filter((m) => dateFilter === "도입날짜" || m.installed_date === dateFilter)
    .sort((a, b) => {
      if (!sortKey) return 0;
      if (sortKey === "status") {
        const diff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        return sortDir === "asc" ? diff : -diff;
      }
      const aVal = a[sortKey] ?? "";
      const bVal = b[sortKey] ?? "";
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">검사기 기준정보</h1>
        <button className="refresh-btn" onClick={() => navigate("/")}>
          대시보드로
        </button>
      </div>

      <div className="filter-buttons">
        {["전체", "LAM", "STK", "COT", "EOL"].map((group) => (
          <button
            key={group}
            onClick={() => {
              setFilter(group);
              setPartitionFilter("설비위치");
              setManufacturerFilter("업체");
              setDateFilter("도입날짜");
            }}
            className={filter === group ? "active" : ""}
          >
            {group}
          </button>
        ))}
      </div>

      <div className="filter-dropdowns">
        <select
          value={partitionFilter}
          onChange={(e) => { setPartitionFilter(e.target.value); setManufacturerFilter("업체"); setDateFilter("도입날짜") }}
        >
          {partitions.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select
          value={manufacturerFilter}
          onChange={(e) => setManufacturerFilter(e.target.value)}
        >
          {manufacturers.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          {installedDates.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="machine-list">
        <div className="machine-row machine-header">
          {COLUMNS.map((col) => (
            <span
              key={col.key}
              className="machine-col-header"
              onDoubleClick={() => handleSort(col.key)}
            >
              {col.label}
              {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
            </span>
          ))}
        </div>

        {displayed.map((machine) => (
          <div key={machine.id} className="machine-row">
            <span
              className="machine-name"
              onClick={() => navigate(`/machines/${machine.id}`)}
            >
              {machine.name}
            </span>
            <span className="machine-group">{machine.process_group}</span>
            <span className="machine-group">{machine.partition}</span>
            <span className="machine-group">{machine.manufacturer}</span>
            <span className="machine-group">{machine.model}</span>
            <span className="machine-group">{machine.installed_date}</span>
            <span
              className="machine-status"
              style={{
                color:
                  machine.status === "정상"
                    ? "#22c55e"
                    : machine.status === "점검중"
                    ? "#eab308"
                    : "#ef4444",
              }}
            >
              {machine.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
