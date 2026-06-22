import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const links = [
    { path: '/',         label: '대시보드',      match: (p) => p === '/' },
    { path: '/machines', label: '검사기 기준정보', match: (p) => p === '/machines' },
    { path: null,        label: '검사기 상세',    match: (p) => p.startsWith('/machines/') },
  ]

  return (
    <nav className="navbar">
      <span className="navbar-logo">🏭 모니터링 시스템</span>
      <div className="navbar-links">
        {links.map(link => (
          <button
            key={link.label}
            className={`navbar-btn ${link.match(location.pathname) ? 'active' : ''}`}
            onClick={() => link.path && navigate(link.path)}
            style={{ opacity: !link.path && !link.match(location.pathname) ? 0.3 : 1 }}
          >
            {link.label}
          </button>
        ))}
      </div>
    </nav>
  )
}