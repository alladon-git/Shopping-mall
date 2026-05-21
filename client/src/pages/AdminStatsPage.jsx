import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/admin.css'

/* ── Heatmap data generator ── */
function buildHeatmap() {
  const cells = []
  const days = ['월', '화', '수', '목', '금', '토', '일']
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      let level = 0
      const isWeekend = d >= 5
      if (h >= 9 && h <= 22) level = 1
      if (h >= 12 && h <= 21) level = 2
      if (!isWeekend && h >= 13 && h <= 16) level = 3
      if (!isWeekend && h >= 17 && h <= 22) level = 4
      if (isWeekend && h >= 14 && h <= 20) level = 3
      if (h === 20 || h === 21) level = Math.min(level + 1, 5)
      if (h <= 5) level = 0
      cells.push({ level, label: `${days[d]} ${h}시` })
    }
  }
  return cells
}

/* ── Icons ── */
const IconRevenue = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9a3.5 3.5 0 0 0 0 7h6a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const IconOrder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h14l-1 12H4L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>
  </svg>
)
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/><path d="M22 4v6M19 7h6"/>
  </svg>
)
const IconReturn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7"/>
  </svg>
)
const IconArrowUp = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 17 17 7M17 17V7H7"/>
  </svg>
)
const IconArrowDown = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7 17 17M7 7v10h10"/>
  </svg>
)
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12M6 9l6 6 6-6"/><path d="M5 21h14"/>
  </svg>
)
const NavIconProducts = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/>
  </svg>
)
const NavIconOrders = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h14l-1 12H4L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>
  </svg>
)
const NavIconUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.6"/><path d="M14.5 20a4.6 4.6 0 0 1 6.5-4"/>
  </svg>
)
const NavIconStats = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>
  </svg>
)
const NavIconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
  </svg>
)

/* ── Product SVG thumbnails ── */
const MacThumb = () => (
  <svg viewBox="0 0 100 80"><rect x="10" y="14" width="80" height="46" rx="4" fill="#1D1D1F"/><rect x="14" y="18" width="72" height="38" rx="2" fill="#0a0a0c"/><circle cx="50" cy="37" r="10" fill="#0071E3"/><path d="M4 60 H96 L92 70 H8 Z" fill="#3a3a3c"/></svg>
)
const IPhoneThumb = () => (
  <svg viewBox="0 0 100 80"><rect x="36" y="8" width="28" height="64" rx="6" fill="#5e5847"/><rect x="38" y="10" width="24" height="60" rx="4" fill="#0a0a0c"/><rect x="40" y="20" width="20" height="26" rx="3" fill="#1c1c1e"/><circle cx="50" cy="32" r="6" fill="#3a3a3c"/></svg>
)
const AirPodsThumb = () => (
  <svg viewBox="0 0 100 80"><rect x="22" y="28" width="56" height="34" rx="17" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/><circle cx="38" cy="46" r="6" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/><circle cx="62" cy="46" r="6" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/></svg>
)
const IPadThumb = () => (
  <svg viewBox="0 0 100 80"><rect x="20" y="10" width="60" height="60" rx="6" fill="#1D1D1F"/><rect x="22" y="12" width="56" height="56" rx="4" fill="#FFFFFF"/><rect x="28" y="18" width="22" height="22" rx="3" fill="#0071E3" opacity="0.2"/></svg>
)
const WatchThumb = () => (
  <svg viewBox="0 0 100 80"><rect x="28" y="18" width="44" height="44" rx="12" fill="#1D1D1F"/><rect x="30" y="20" width="40" height="40" rx="9" fill="#0a0a0c"/></svg>
)

/* ── KPI Sparklines ── */
const SparkRevenue = () => (
  <svg className="spark" viewBox="0 0 130 50" preserveAspectRatio="none">
    <defs><linearGradient id="sp1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0071E3" stopOpacity="0.25"/><stop offset="100%" stopColor="#0071E3" stopOpacity="0"/></linearGradient></defs>
    <path d="M0 35 L15 32 L30 38 L45 30 L60 28 L75 20 L90 22 L105 15 L120 12 L130 8 L130 50 L0 50 Z" fill="url(#sp1)"/>
    <path d="M0 35 L15 32 L30 38 L45 30 L60 28 L75 20 L90 22 L105 15 L120 12 L130 8" stroke="#0071E3" strokeWidth="1.5" fill="none"/>
  </svg>
)
const SparkOrders = () => (
  <svg className="spark" viewBox="0 0 130 50" preserveAspectRatio="none">
    <defs><linearGradient id="sp2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34C759" stopOpacity="0.25"/><stop offset="100%" stopColor="#34C759" stopOpacity="0"/></linearGradient></defs>
    <path d="M0 30 L15 35 L30 28 L45 32 L60 25 L75 28 L90 22 L105 18 L120 14 L130 12 L130 50 L0 50 Z" fill="url(#sp2)"/>
    <path d="M0 30 L15 35 L30 28 L45 32 L60 25 L75 28 L90 22 L105 18 L120 14 L130 12" stroke="#34C759" strokeWidth="1.5" fill="none"/>
  </svg>
)
const SparkMembers = () => (
  <svg className="spark" viewBox="0 0 130 50" preserveAspectRatio="none">
    <defs><linearGradient id="sp3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF9500" stopOpacity="0.25"/><stop offset="100%" stopColor="#FF9500" stopOpacity="0"/></linearGradient></defs>
    <path d="M0 25 L15 30 L30 22 L45 28 L60 26 L75 18 L90 20 L105 14 L120 18 L130 14 L130 50 L0 50 Z" fill="url(#sp3)"/>
    <path d="M0 25 L15 30 L30 22 L45 28 L60 26 L75 18 L90 20 L105 14 L120 18 L130 14" stroke="#FF9500" strokeWidth="1.5" fill="none"/>
  </svg>
)
const SparkReturn = () => (
  <svg className="spark" viewBox="0 0 130 50" preserveAspectRatio="none">
    <defs><linearGradient id="sp4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF3B30" stopOpacity="0.25"/><stop offset="100%" stopColor="#FF3B30" stopOpacity="0"/></linearGradient></defs>
    <path d="M0 18 L15 16 L30 22 L45 20 L60 24 L75 28 L90 26 L105 32 L120 34 L130 36 L130 50 L0 50 Z" fill="url(#sp4)"/>
    <path d="M0 18 L15 16 L30 22 L45 20 L60 24 L75 28 L90 26 L105 32 L120 34 L130 36" stroke="#FF3B30" strokeWidth="1.5" fill="none"/>
  </svg>
)

export default function AdminStatsPage() {
  const [rangePill, setRangePill] = useState('최근 30일')
  const [chartTab, setChartTab] = useState('매출')
  const heatmapCells = useRef(buildHeatmap())

  const rangePills = ['오늘', '어제', '최근 7일', '최근 30일', '최근 90일', '올해', '사용자 지정']

  return (
    <div className="adm-shell">
      {/* ── Sidebar ── */}
      <aside className="adm-side">
        <Link to="/" className="adm-brand">
          <span style={{ fontSize: 18 }}>&#63743;</span> Admin
        </Link>
        <p className="adm-section-label">MENU</p>
        <nav className="adm-nav-list">
          <Link to="/admin/products" className="adm-nav-item">
            <span className="ico"><NavIconProducts /></span>상품 관리
          </Link>
          <Link to="/admin/orders" className="adm-nav-item">
            <span className="ico"><NavIconOrders /></span>주문 관리
          </Link>
          <button className="adm-nav-item" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
            <span className="ico"><NavIconUsers /></span>회원 관리
          </button>
          <Link to="/admin/stats" className="adm-nav-item active">
            <span className="ico"><NavIconStats /></span>통계
          </Link>
        </nav>
        <div className="adm-nav-spacer" />
        <div className="adm-nav-foot">
          <div className="adm-avatar">JK</div>
          <div className="adm-foot-text">
            <div className="nm">정관리</div>
            <div className="em">admin@reapple.kr</div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">
        {/* Header */}
        <header className="adm-head">
          <div>
            <p className="eyebrow">ANALYTICS</p>
            <h1 className="h-display h-28">통계 대시보드</h1>
          </div>
          <button className="btn-outline" type="button">
            <IconDownload />리포트 다운로드
          </button>
        </header>

        {/* Date range bar */}
        <section className="range-bar">
          {rangePills.map((p) => (
            <button
              key={p}
              className={`pill-f${rangePill === p ? ' active' : ''}`}
              onClick={() => setRangePill(p)}
            >
              {p}
            </button>
          ))}
          <span className="right">
            <span className="last-sync">
              <span className="s-dot ok" />실시간 동기화 · 5분 전
            </span>
          </span>
        </section>

        {/* KPI Cards */}
        <section className="kpis">
          {/* 총 매출 */}
          <div className="kpi">
            <div className="lbl-row">
              <p className="lbl">총 매출</p>
              <span className="ico"><IconRevenue /></span>
            </div>
            <p className="v">₩412,890,000</p>
            <div className="delta-row">
              <span className="delta up"><IconArrowUp />+18.2%</span>
              <span className="compare">전월 ₩349,310K</span>
            </div>
            <SparkRevenue />
          </div>
          {/* 주문 건수 */}
          <div className="kpi success">
            <div className="lbl-row">
              <p className="lbl">주문 건수</p>
              <span className="ico"><IconOrder /></span>
            </div>
            <p className="v">1,247</p>
            <div className="delta-row">
              <span className="delta up"><IconArrowUp />+12.8%</span>
              <span className="compare">전월 1,105건</span>
            </div>
            <SparkOrders />
          </div>
          {/* 신규 회원 */}
          <div className="kpi warning">
            <div className="lbl-row">
              <p className="lbl">신규 회원</p>
              <span className="ico"><IconUser /></span>
            </div>
            <p className="v">312</p>
            <div className="delta-row">
              <span className="delta up"><IconArrowUp />+6.9%</span>
              <span className="compare">전월 292명</span>
            </div>
            <SparkMembers />
          </div>
          {/* 반품률 */}
          <div className="kpi danger">
            <div className="lbl-row">
              <p className="lbl">반품률</p>
              <span className="ico"><IconReturn /></span>
            </div>
            <p className="v">2.4<span style={{ fontSize: 17, color: 'var(--ink2)' }}>%</span></p>
            <div className="delta-row">
              <span className="delta down"><IconArrowDown />−0.6%p</span>
              <span className="compare">전월 3.0%</span>
            </div>
            <SparkReturn />
          </div>
        </section>

        {/* Sales chart + Donut */}
        <section className="grid-2">
          {/* Sales line chart */}
          <div className="chart-card">
            <header className="chart-head">
              <div>
                <h2 className="chart-title">매출 추이</h2>
                <p className="chart-sub">최근 30일 일별 매출과 전월 동기 비교</p>
              </div>
              <div className="chart-toggle">
                {['매출', '주문 수', '방문자'].map((t) => (
                  <button key={t} className={chartTab === t ? 'active' : ''} onClick={() => setChartTab(t)}>{t}</button>
                ))}
              </div>
            </header>
            <div className="legend-row">
              <span className="item"><span className="swatch" style={{ background: 'var(--cta)' }} />이번 달</span>
              <span className="item"><span className="swatch" style={{ background: 'var(--ink3)' }} />전월</span>
            </div>
            <div className="chart-body">
              <svg className="sales-chart" viewBox="0 0 720 240" preserveAspectRatio="none">
                <g stroke="#D2D2D7" strokeWidth="0.5" strokeDasharray="3 4">
                  <line x1="0" y1="40" x2="720" y2="40"/>
                  <line x1="0" y1="100" x2="720" y2="100"/>
                  <line x1="0" y1="160" x2="720" y2="160"/>
                  <line x1="0" y1="220" x2="720" y2="220"/>
                </g>
                <g fill="#AEAEB2" fontFamily="SF Pro Text, -apple-system, sans-serif" fontSize="9">
                  <text x="6" y="36">₩20M</text>
                  <text x="6" y="96">₩15M</text>
                  <text x="6" y="156">₩10M</text>
                  <text x="6" y="216">₩5M</text>
                </g>
                {/* prev month dashed */}
                <path d="M40 180 L80 175 L120 178 L160 170 L200 165 L240 168 L280 158 L320 160 L360 150 L400 145 L440 148 L480 140 L520 135 L560 130 L600 128 L640 125 L680 120"
                  stroke="#AEAEB2" strokeWidth="1.5" fill="none" strokeDasharray="4 4"/>
                <defs>
                  <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0071E3" stopOpacity="0.25"/>
                    <stop offset="100%" stopColor="#0071E3" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* this month area */}
                <path d="M40 170 L80 160 L120 155 L160 150 L200 140 L240 145 L280 130 L320 135 L360 115 L400 110 L440 120 L480 95 L520 80 L560 90 L600 75 L640 60 L680 55 L680 240 L40 240 Z"
                  fill="url(#areaG)"/>
                <path d="M40 170 L80 160 L120 155 L160 150 L200 140 L240 145 L280 130 L320 135 L360 115 L400 110 L440 120 L480 95 L520 80 L560 90 L600 75 L640 60 L680 55"
                  stroke="#0071E3" strokeWidth="2" fill="none"/>
                <g fill="#0071E3">
                  <circle cx="680" cy="55" r="4"/>
                  <circle cx="680" cy="55" r="8" fill="#0071E3" opacity="0.2"/>
                </g>
                <line x1="680" y1="0" x2="680" y2="220" stroke="#0071E3" strokeWidth="0.5" strokeDasharray="2 3"/>
                <g fill="#AEAEB2" fontFamily="SF Pro Text, -apple-system, sans-serif" fontSize="9">
                  <text x="40" y="232">4/18</text>
                  <text x="160" y="232">4/24</text>
                  <text x="320" y="232">4/30</text>
                  <text x="480" y="232">5/6</text>
                  <text x="640" y="232">5/12</text>
                </g>
              </svg>
            </div>
          </div>

          {/* Donut: category revenue */}
          <div className="chart-card">
            <header className="chart-head">
              <div>
                <h2 className="chart-title">카테고리별 매출</h2>
                <p className="chart-sub">최근 30일</p>
              </div>
            </header>
            <div className="donut-wrap">
              <div className="donut">
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="var(--bg2)" strokeWidth="14"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#0071E3" strokeWidth="14" strokeDasharray="95 226" strokeDashoffset="0"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#34C759" strokeWidth="14" strokeDasharray="63 226" strokeDashoffset="-95"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#FF9500" strokeWidth="14" strokeDasharray="32 226" strokeDashoffset="-158"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#FF3B30" strokeWidth="14" strokeDasharray="20 226" strokeDashoffset="-190"/>
                  <circle cx="50" cy="50" r="36" fill="none" stroke="#6A0DAD" strokeWidth="14" strokeDasharray="16 226" strokeDashoffset="-210"/>
                </svg>
                <div className="center">
                  <p className="l">총 매출</p>
                  <p className="v">₩412M</p>
                </div>
              </div>
              <div className="donut-list">
                {[
                  { color: '#0071E3', label: 'Mac', pct: '42%' },
                  { color: '#34C759', label: 'iPhone', pct: '28%' },
                  { color: '#FF9500', label: 'iPad', pct: '14%' },
                  { color: '#FF3B30', label: 'Watch', pct: '9%' },
                  { color: '#6A0DAD', label: 'AirPods', pct: '7%' },
                ].map((item) => (
                  <div key={item.label} className="donut-item">
                    <span className="sw" style={{ background: item.color }} />
                    <span className="lbl">{item.label}</span>
                    <span className="pct">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Best sellers + Traffic sources + Activity */}
        <section className="grid-3">
          {/* Best sellers */}
          <div className="chart-card">
            <header className="chart-head">
              <div>
                <h2 className="chart-title">베스트셀러</h2>
                <p className="chart-sub">최근 30일 판매량 기준</p>
              </div>
            </header>
            <div style={{ padding: '4px 20px 20px' }}>
              {[
                { rank: 1, thumb: <MacThumb />, name: 'MacBook Pro 14 M3 Pro', meta: '128건 · ₩318,720K', val: 128, delta: '+24%', up: true },
                { rank: 2, thumb: <IPhoneThumb />, name: 'iPhone 16 Pro 256GB', meta: '114건 · ₩176,700K', val: 114, delta: '+18%', up: true },
                { rank: 3, thumb: <AirPodsThumb />, name: 'AirPods Pro 2세대', meta: '96건 · ₩34,464K', val: 96, delta: '+8%', up: true },
                { rank: 4, thumb: <IPadThumb />, name: 'iPad Pro M4 11"', meta: '72건 · ₩89,928K', val: 72, delta: '−4%', up: false },
                { rank: 5, thumb: <WatchThumb />, name: 'Apple Watch S10', meta: '58건 · ₩34,742K', val: 58, delta: '+12%', up: true },
              ].map((p) => (
                <div key={p.rank} className="tp-row">
                  <span className={`tp-rank${p.rank <= 3 ? ` top${p.rank}` : ''}`}>{p.rank}</span>
                  <div className="tp-thumb">{p.thumb}</div>
                  <div className="tp-info">
                    <p className="nm">{p.name}</p>
                    <p className="meta">{p.meta}</p>
                  </div>
                  <span className="tp-val">{p.val}</span>
                  <span className={`tp-delta ${p.up ? 'up' : 'down'}`}>{p.delta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic sources */}
          <div className="chart-card">
            <header className="chart-head">
              <div>
                <h2 className="chart-title">유입 경로</h2>
                <p className="chart-sub">방문자 기준 최근 30일</p>
              </div>
            </header>
            <div className="bar-list">
              {[
                { label: '검색 (Google · Naver)', val: '38,924', pct: 42.1, color: 'var(--cta)' },
                { label: '직접 방문', val: '24,310', pct: 26.3, color: 'var(--success)' },
                { label: 'SNS (Instagram · YouTube)', val: '15,287', pct: 16.5, color: 'var(--warning)' },
                { label: '광고 (Google Ads)', val: '9,142', pct: 9.9, color: '#6A0DAD' },
                { label: '이메일·뉴스레터', val: '3,892', pct: 4.2, color: 'var(--danger)' },
                { label: '기타', val: '931', pct: 1.0, color: 'var(--ink3)' },
              ].map((src) => (
                <div key={src.label} className="bar-row">
                  <div className="bar-head">
                    <span className="nm">{src.label}</span>
                    <span className="val">{src.val}</span>
                    <span className="pct">{src.pct}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${src.pct}%`, background: src.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity log */}
          <div className="chart-card">
            <header className="chart-head">
              <div>
                <h2 className="chart-title">실시간 활동</h2>
                <p className="chart-sub">최근 알림</p>
              </div>
              <span className="last-sync" style={{ fontSize: 11, color: 'var(--success)' }}>
                <span className="s-dot ok" />LIVE
              </span>
            </header>
            <div className="activity-list">
              {[
                { dot: 'success', txt: <><strong>홍길동</strong>님이 ₩2,849,000 주문 완료</>, time: '2분 전 · RA-2026-0517-8421' },
                { dot: '', txt: <><strong>김미정</strong>님이 신규 가입</>, time: '8분 전' },
                { dot: 'warning', txt: <><strong>iPhone 15 Pro 256GB</strong> 재고 임박 (3개 남음)</>, time: '15분 전' },
                { dot: 'danger', txt: <><strong>정민호</strong>님이 반품 요청 · MacBook Air 15</>, time: '22분 전' },
                { dot: 'success', txt: <><strong>박서준</strong>님이 ★★★★★ 리뷰 작성</>, time: '28분 전 · iPad Pro M4' },
                { dot: '', txt: <><strong>이정환</strong>님이 위시리스트에 8개 상품 추가</>, time: '35분 전' },
                { dot: 'warning', txt: <>결제 실패율 평소보다 높음 (현대카드)</>, time: '1시간 전' },
              ].map((item, i) => (
                <div key={i} className="a-row">
                  <span className={`a-dot${item.dot ? ` ${item.dot}` : ''}`} />
                  <div className="a-body">
                    <p className="txt">{item.txt}</p>
                    <p className="time">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Heatmap */}
        <section className="chart-card">
          <header className="chart-head">
            <div>
              <h2 className="chart-title">요일·시간대별 방문 패턴</h2>
              <p className="chart-sub">최근 90일 평균 방문량</p>
            </div>
          </header>
          <div className="heatmap">
            <div className="hm-day-labels">
              {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="hm-cells">
              <div className="hm-hour-labels">
                {['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22'].map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              <div className="hm-grid">
                {heatmapCells.current.map((cell, i) => (
                  <div
                    key={i}
                    className={`hm-cell${cell.level > 0 ? ` l${cell.level}` : ''}`}
                    title={cell.label}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="hm-legend" style={{ padding: '0 20px 16px' }}>
            <span>적음</span>
            <span className="sw">
              <span style={{ background: 'var(--bg2)' }} />
              <span style={{ background: 'rgba(0,113,227,0.15)' }} />
              <span style={{ background: 'rgba(0,113,227,0.35)' }} />
              <span style={{ background: 'rgba(0,113,227,0.6)' }} />
              <span style={{ background: 'rgba(0,113,227,0.85)' }} />
              <span style={{ background: 'var(--cta)' }} />
            </span>
            <span>많음</span>
          </div>
        </section>
      </main>
    </div>
  )
}
