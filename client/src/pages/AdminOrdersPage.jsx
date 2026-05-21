import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import '../styles/admin.css'

/* ── Design tokens ── */
const ink     = '#1D1D1F'
const ink2    = '#6E6E73'
const ink3    = '#AEAEB2'
const cta     = '#0071E3'
const divider = '#D2D2D7'
const danger  = '#FF3B30'
const success = '#34C759'
const bg2     = '#F5F5F7'

const won = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR')

/* ── Status config ── */
const STATUS_META = {
  pending:   { text: '주문 접수',  bg: '#FFF3E0', color: '#FF9500' },
  confirmed: { text: '결제 완료', bg: '#E8F5E9', color: '#2E7D32' },
  shipped:   { text: '배송 중',   bg: '#E3F2FD', color: cta },
  delivered: { text: '배송 완료', bg: '#E8F5E9', color: success },
  cancelled: { text: '취소됨',    bg: '#FFEBEE', color: danger },
  refunded:  { text: '환불 완료', bg: '#F5F5F7', color: ink3 },
}
const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']
const PAY_LABEL = { card: '카드', bank_transfer: '계좌이체', kakao_pay: '카카오페이' }

/* ── SVG Icons ── */
const Svg = ({ size = 16, stroke = 1.7, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const IconPackage  = () => <Svg><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></Svg>
const IconOrders   = () => <Svg><path d="M3 7h14l-1 12H4L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></Svg>
const IconUsers    = () => <Svg><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.6"/><path d="M14.5 20a4.6 4.6 0 0 1 6.5-4"/></Svg>
const IconStats    = () => <Svg><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Svg>
const IconSearch   = () => <Svg size={14}><circle cx="10.5" cy="10.5" r="7"/><path d="m21 21-5-5"/></Svg>
const IconChevronL = () => <Svg size={14} stroke={2}><path d="m15 18-6-6 6-6"/></Svg>
const IconChevronR = () => <Svg size={14} stroke={2}><path d="m9 18 6-6-6-6"/></Svg>
const IconX        = () => <Svg size={14} stroke={2}><path d="M18 6 6 18M6 6l12 12"/></Svg>
const IconAlert    = () => <Svg size={20} stroke={1.7}><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></Svg>
const IconEdit     = () => <Svg size={14}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></Svg>

const AppleLogo = () => (
  <svg width={14} height={17} viewBox="0 0 20 24" fill="currentColor">
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Toast ── */
function Toast({ msg, kind, visible }) {
  const bg = kind === 'error' ? danger : kind === 'success' ? success : ink
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(16px)',
      background: bg, color: '#fff', borderRadius: 980,
      padding: '10px 18px', fontSize: 13,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 12px 40px -8px rgba(0,0,0,0.28)',
      opacity: visible ? 1 : 0, pointerEvents: 'none',
      transition: 'opacity 0.22s, transform 0.28s cubic-bezier(.2,.7,.2,1)',
      zIndex: 200, letterSpacing: '-0.005em', whiteSpace: 'nowrap',
    }}>
      {msg}
    </div>
  )
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? { text: status, bg: bg2, color: ink2 }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 9px', borderRadius: 980,
      background: m.bg, color: m.color,
      fontSize: 11.5, fontWeight: 600, letterSpacing: '-0.005em', whiteSpace: 'nowrap',
    }}>
      {m.text}
    </span>
  )
}

/* ── Status Update Modal ── */
function StatusModal({ order, onSave, onClose, saving }) {
  const [status, setStatus] = useState(order.status)
  const [cancelReason, setCancelReason] = useState('')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px -10px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `0.5px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: ink2, margin: '0 0 3px' }}>주문 상태 변경</p>
            <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 18, fontWeight: 600, margin: 0, letterSpacing: '-0.02em', color: ink }}>
              {order.orderNumber}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: bg2, border: 0, display: 'grid', placeItems: 'center', cursor: 'pointer', color: ink2 }}>
            <IconX />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          {/* 주문 요약 */}
          <div style={{ background: bg2, borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: 13, color: ink2 }}>
            <p style={{ margin: '0 0 4px' }}>
              <span style={{ color: ink, fontWeight: 500 }}>{order.user?.name ?? '고객'}</span>
              {order.user?.email && <span style={{ marginLeft: 6 }}>{order.user.email}</span>}
            </p>
            <p style={{ margin: 0 }}>
              {order.items?.length}개 상품 · {won(order.pricing?.total)}
            </p>
          </div>

          {/* 상태 선택 */}
          <p style={{ fontSize: 12, fontWeight: 500, color: ink, margin: '0 0 10px' }}>새 상태 선택</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {STATUS_OPTIONS.map((s) => {
              const m = STATUS_META[s]
              const isSelected = status === s
              return (
                <button key={s} onClick={() => setStatus(s)} type="button"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10, width: '100%', textAlign: 'left',
                    border: `1.5px solid ${isSelected ? cta : divider}`,
                    background: isSelected ? '#EEF5FF' : '#fff',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: ink, flex: 1 }}>{m.text}</span>
                  {order.status === s && (
                    <span style={{ fontSize: 11, color: ink3 }}>현재</span>
                  )}
                  {isSelected && order.status !== s && (
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={cta} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>
                  )}
                </button>
              )
            })}
          </div>

          {/* 취소 사유 */}
          {status === 'cancelled' && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: ink, margin: '0 0 6px' }}>취소 사유</p>
              <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                placeholder="취소 사유를 입력하세요 (선택)"
                rows={2}
                style={{ width: '100%', padding: '10px 12px', border: `0.5px solid ${divider}`, borderRadius: 8, fontSize: 13, color: ink, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = cta}
                onBlur={e => e.target.style.borderColor = divider}
              />
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose}
              style={{ flex: 1, height: 42, background: bg2, border: `0.5px solid ${divider}`, borderRadius: 10, fontSize: 14, color: ink, cursor: 'pointer', fontFamily: 'inherit' }}>
              취소
            </button>
            <button onClick={() => onSave(order._id, status, cancelReason)} disabled={saving || status === order.status}
              style={{ flex: 2, height: 42, background: status === order.status ? ink3 : cta, border: 0, borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#fff', cursor: (saving || status === order.status) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.005em' }}>
              {saving ? '저장 중…' : '상태 변경'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════ */
const STATUS_FILTERS = [
  { key: '',          label: '전체' },
  { key: 'pending',   label: '주문 접수' },
  { key: 'confirmed', label: '결제 완료' },
  { key: 'shipped',   label: '배송 중' },
  { key: 'delivered', label: '배송 완료' },
  { key: 'cancelled', label: '취소됨' },
  { key: 'refunded',  label: '환불 완료' },
]

export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [orders, setOrders]       = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading]     = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch]       = useState('')

  const [editOrder, setEditOrder] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState({ visible: false, msg: '', kind: 'success' })

  const showToast = (msg, kind = 'success') => {
    setToast({ visible: true, msg, kind })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (statusFilter) params.status = statusFilter
      const { data } = await api.get('/orders/admin', { params })
      setOrders(data.orders)
      setPagination(data.pagination)
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout(); navigate('/login')
      } else {
        showToast('주문 목록을 불러오지 못했습니다.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchOrders(1) }, [fetchOrders])

  const handleStatusSave = async (orderId, status, cancelReason) => {
    setSaving(true)
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status, cancelReason })
      showToast('주문 상태가 변경되었습니다.')
      setEditOrder(null)
      fetchOrders(pagination.page)
    } catch (err) {
      showToast(err.response?.data?.message || '상태 변경에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  /* 검색 필터 (클라이언트 사이드) */
  const filtered = search.trim()
    ? orders.filter(o =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="adm-shell" style={{ fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside className="adm-side">
        <Link to="/" className="adm-brand">
          <AppleLogo />
          ReApple
        </Link>

        <p className="adm-section-label">관리</p>
        <nav className="adm-nav-list">
          <Link to="/admin/products" className="adm-nav-item">
            <span className="ico"><IconPackage /></span>상품 관리
          </Link>
          <Link to="/admin/orders" className="adm-nav-item active">
            <span className="ico"><IconOrders /></span>주문 관리
          </Link>
          <button className="adm-nav-item" disabled style={{ opacity: 0.4, cursor: 'not-allowed' }}>
            <span className="ico"><IconUsers /></span>회원 관리
          </button>
          <Link to="/admin/stats" className="adm-nav-item">
            <span className="ico"><IconStats /></span>통계
          </Link>
        </nav>

        <div className="adm-nav-spacer" />
        <div style={{ padding: '12px 10px', borderTop: '0.5px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div className="adm-avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="adm-foot-text" style={{ minWidth: 0 }}>
              <p className="nm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || '관리자'}</p>
              <p className="em" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', height: 32,
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer', fontSize: 12,
              fontFamily: 'inherit', letterSpacing: '-0.005em',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">

        {/* Page header */}
        <div className="adm-head">
          <div>
            <p className="eyebrow">ORDERS / MANAGEMENT</p>
            <h1 className="h-display h-28">주문 관리</h1>
          </div>
          <span style={{ fontSize: 13, color: ink2 }}>
            총 <strong style={{ color: ink }}>{pagination.total}</strong>건
          </span>
        </div>

        {/* ── Filter bar ── */}
        <div style={{ background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 160 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: ink3, pointerEvents: 'none' }}>
              <IconSearch />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="주문번호, 고객명, 이메일 검색…"
              style={{ width: '100%', height: 36, padding: '0 12px 0 34px', border: `0.5px solid ${divider}`, borderRadius: 8, fontSize: 13, color: ink, background: bg2, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map(f => (
              <button key={f.key} onClick={() => { setStatusFilter(f.key); setSearch('') }}
                style={{ height: 32, padding: '0 13px', borderRadius: 980, fontSize: 12, border: `0.5px solid ${statusFilter === f.key ? ink : divider}`, background: statusFilter === f.key ? ink : '#fff', color: statusFilter === f.key ? '#fff' : ink2, cursor: 'pointer', letterSpacing: '-0.005em', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 14, overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '148px 130px 1fr 110px 80px 110px 80px', gap: '0 12px', padding: '10px 18px', borderBottom: `0.5px solid ${divider}`, background: bg2 }}>
            {['주문번호', '고객', '상품', '결제금액', '결제수단', '상태', ''].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 500, color: ink2, letterSpacing: '-0.005em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: ink2, fontSize: 13 }}>불러오는 중…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '64px 0', textAlign: 'center' }}>
              <div style={{ color: ink3, marginBottom: 10 }}>
                <IconOrders />
              </div>
              <p style={{ color: ink2, fontSize: 14, margin: 0 }}>
                {search ? '검색 결과가 없습니다.' : '주문이 없습니다.'}
              </p>
            </div>
          ) : (
            filtered.map((order, i) => {
              const firstItem = order.items?.[0]
              const moreCount = (order.items?.length ?? 1) - 1
              return (
                <div
                  key={order._id}
                  style={{
                    display: 'grid', gridTemplateColumns: '148px 130px 1fr 110px 80px 110px 80px',
                    gap: '0 12px', padding: '13px 18px', alignItems: 'center',
                    borderTop: i === 0 ? 'none' : `0.5px solid ${divider}`,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = bg2}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  {/* 주문번호 + 날짜 */}
                  <div>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: ink, fontFamily: 'monospace', letterSpacing: '0.01em' }}>
                      {order.orderNumber}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: ink3 }}>
                      {new Date(order.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* 고객 */}
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.user?.name ?? '(삭제된 계정)'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: ink3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {order.user?.email ?? ''}
                    </p>
                  </div>

                  {/* 상품명 */}
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: 13, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {firstItem?.name ?? '—'}
                      {moreCount > 0 && (
                        <span style={{ marginLeft: 6, fontSize: 11, color: ink3 }}>외 {moreCount}건</span>
                      )}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: ink3 }}>
                      총 {order.items?.length ?? 0}개 상품
                    </p>
                  </div>

                  {/* 결제금액 */}
                  <span style={{ fontSize: 14, fontWeight: 600, color: ink, letterSpacing: '-0.01em' }}>
                    {won(order.pricing?.total)}
                  </span>

                  {/* 결제수단 */}
                  <span style={{ fontSize: 12, color: ink2 }}>
                    {PAY_LABEL[order.payment?.method] ?? order.payment?.method ?? '—'}
                  </span>

                  {/* 상태 */}
                  <StatusBadge status={order.status} />

                  {/* 액션 */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setEditOrder(order)}
                      style={{ width: 30, height: 30, borderRadius: 8, background: bg2, border: `0.5px solid ${divider}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: ink2 }}
                      title="상태 변경">
                      <IconEdit />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button onClick={() => fetchOrders(pagination.page - 1)} disabled={pagination.page === 1}
              style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', border: `0.5px solid ${divider}`, display: 'grid', placeItems: 'center', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.4 : 1, color: ink }}>
              <IconChevronL />
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => fetchOrders(n)}
                style={{ width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: n === pagination.page ? 600 : 400, background: n === pagination.page ? ink : '#fff', color: n === pagination.page ? '#fff' : ink, border: `0.5px solid ${n === pagination.page ? ink : divider}`, cursor: 'pointer', fontFamily: 'inherit' }}>
                {n}
              </button>
            ))}
            <button onClick={() => fetchOrders(pagination.page + 1)} disabled={pagination.page === pagination.pages}
              style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', border: `0.5px solid ${divider}`, display: 'grid', placeItems: 'center', cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.pages ? 0.4 : 1, color: ink }}>
              <IconChevronR />
            </button>
          </div>
        )}
      </main>

      {/* ── Status Modal ── */}
      {editOrder && (
        <StatusModal
          order={editOrder}
          onSave={handleStatusSave}
          onClose={() => setEditOrder(null)}
          saving={saving}
        />
      )}

      <Toast msg={toast.msg} kind={toast.kind} visible={toast.visible} />
    </div>
  )
}
