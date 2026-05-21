import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

/* ── Tokens ── */
const ink     = '#1D1D1F'
const ink2    = '#6E6E73'
const ink3    = '#AEAEB2'
const cta     = '#0071E3'
const danger  = '#FF3B30'
const divider = '#D2D2D7'
const bg2     = '#F5F5F7'
const success = '#34C759'

const won = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR')

const STATUS_META = {
  pending:   { text: '주문 접수',  bg: '#FFF3E0', color: '#FF9500' },
  confirmed: { text: '결제 완료', bg: '#E8F5E9', color: '#2E7D32' },
  shipped:   { text: '배송 중',   bg: '#E3F2FD', color: cta },
  delivered: { text: '배송 완료', bg: '#E8F5E9', color: success },
  cancelled: { text: '취소됨',    bg: '#FFEBEE', color: danger },
  refunded:  { text: '환불 완료', bg: '#F5F5F7', color: ink3 },
}

const PAY_LABEL = { card: '카드', bank_transfer: '계좌이체', kakao_pay: '카카오페이' }

/* ── Icons ── */
const Svg = ({ size = 20, stroke = 1.6, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const IcoChevR  = () => <Svg size={16} stroke={2}><path d="m9 18 6-6-6-6"/></Svg>
const IcoChevL  = () => <Svg size={16} stroke={2}><path d="m15 18-6-6 6-6"/></Svg>
const IcoBag    = () => <Svg size={40} stroke={1.2}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></Svg>
const IcoFilter = () => <Svg size={16} stroke={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></Svg>

const AppleLogo = () => (
  <svg width={16} height={19} viewBox="0 0 20 24" fill={ink}>
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── 상태 뱃지 ── */
function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? { text: status, bg: bg2, color: ink2 }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 980,
      background: m.bg, color: m.color,
      fontSize: 12, fontWeight: 600, letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
    }}>
      {m.text}
    </span>
  )
}

/* ── 주문 카드 ── */
function OrderCard({ order, onClick }) {
  const firstItem = order.items[0]
  const moreCount = order.items.length - 1

  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        background: '#fff', border: `1px solid ${divider}`,
        borderRadius: 16, padding: '20px 24px',
        cursor: 'pointer', fontFamily: 'inherit', color: ink,
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = '#C7C7CC'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = divider
      }}
    >
      {/* 상단: 주문번호 + 날짜 + 상태 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: ink, letterSpacing: '0.01em' }}>
            {order.orderNumber}
          </span>
          <span style={{ fontSize: 12, color: ink3, marginLeft: 10 }}>
            {new Date(order.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* 상품 이미지 목록 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        {order.items.slice(0, 4).map((item, i) => (
          <div key={item._id ?? i} style={{
            width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
            background: bg2, border: `0.5px solid ${divider}`, flexShrink: 0,
            position: 'relative',
          }}>
            {item.image
              ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', background: '#E5E5EA' }} />
            }
          </div>
        ))}
        {order.items.length > 4 && (
          <div style={{
            width: 64, height: 64, borderRadius: 10, background: bg2,
            border: `0.5px solid ${divider}`, flexShrink: 0,
            display: 'grid', placeItems: 'center',
            fontSize: 13, fontWeight: 600, color: ink2,
          }}>
            +{order.items.length - 4}
          </div>
        )}
      </div>

      {/* 상품명 */}
      <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px', color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {firstItem?.name}{moreCount > 0 ? ` 외 ${moreCount}건` : ''}
      </p>

      {/* 하단: 결제수단 + 금액 + 화살표 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <span style={{ fontSize: 13, color: ink3 }}>
          {PAY_LABEL[order.payment?.method] ?? order.payment?.method}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: '"SF Pro Display",-apple-system,sans-serif',
            fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: ink,
          }}>
            {won(order.pricing?.total)}
          </span>
          <span style={{ color: ink3, display: 'inline-flex' }}><IcoChevR /></span>
        </div>
      </div>
    </button>
  )
}

/* ── 스켈레톤 ── */
function Skeleton() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${divider}`, borderRadius: 16, padding: '20px 24px' }}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      {[1,2,3].map((i) => (
        <div key={i} style={{ height: i === 2 ? 64 : 16, borderRadius: 8, marginBottom: i === 3 ? 0 : 12,
          background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
          width: i === 1 ? '60%' : '100%',
        }} />
      ))}
    </div>
  )
}

/* ── 필터 탭 ── */
const FILTERS = [
  { key: '',          label: '전체' },
  { key: 'confirmed', label: '결제 완료' },
  { key: 'shipped',   label: '배송 중' },
  { key: 'delivered', label: '배송 완료' },
  { key: 'cancelled', label: '취소/환불' },
]

/* ─────────────────────────────
   메인 컴포넌트
───────────────────────────── */
export default function OrdersPage() {
  const navigate = useNavigate()
  const { token, logout } = useAuthStore()

  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')
  const [page, setPage]       = useState(1)
  const [pagination, setPagination] = useState({ pages: 1, total: 0 })

  useEffect(() => {
    if (!token) { navigate('/login'); return }
  }, [token])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit: 10 })
    if (filter) {
      if (filter === 'cancelled') {
        params.set('status', 'cancelled')
      } else {
        params.set('status', filter)
      }
    }

    api.get(`/orders?${params}`)
      .then(({ data }) => {
        setOrders(data.orders)
        setPagination(data.pagination)
      })
      .catch((err) => {
        if (err.response?.status === 401) logout()
      })
      .finally(() => setLoading(false))
  }, [filter, page, token])

  const handleFilterChange = (key) => {
    setFilter(key)
    setPage(1)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fff', color: ink,
      fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
      fontSize: 17, lineHeight: 1.45, WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .orders-anim { animation: fadeUp 0.4s cubic-bezier(.2,.7,.2,1) both; }
        .filter-btn:hover { background: #E5E5EA !important; }
      `}</style>

      {/* ── 헤더 ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: `inset 0 -0.5px 0 ${divider}`,
        height: 48,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', color: ink }}>
            <AppleLogo />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>ReApple</span>
          </button>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: cta, fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
            쇼핑 계속하기
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 96px' }}>

        {/* ── 페이지 제목 ── */}
        <div className="orders-anim" style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: '"SF Pro Display",-apple-system,sans-serif',
            fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em',
            margin: '0 0 6px', color: ink,
          }}>
            주문 내역
          </h1>
          {pagination.total > 0 && (
            <p style={{ fontSize: 15, color: ink3, margin: 0 }}>총 {pagination.total}건</p>
          )}
        </div>

        {/* ── 상태 필터 탭 ── */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 24,
          overflowX: 'auto', paddingBottom: 4,
        }}>
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                className="filter-btn"
                onClick={() => handleFilterChange(f.key)}
                style={{
                  padding: '7px 16px', borderRadius: 980, fontSize: 14, fontWeight: active ? 600 : 400,
                  border: active ? 'none' : `1px solid ${divider}`,
                  background: active ? ink : '#fff',
                  color: active ? '#fff' : ink2,
                  cursor: 'pointer', fontFamily: 'inherit',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  transition: 'background 0.15s, color 0.15s',
                }}>
                {f.label}
              </button>
            )
          })}
        </div>

        {/* ── 주문 목록 ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          /* 빈 상태 */
          <div className="orders-anim" style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ color: ink3, display: 'inline-flex', marginBottom: 16 }}><IcoBag /></div>
            <p style={{ fontSize: 18, fontWeight: 600, color: ink, margin: '0 0 8px' }}>
              {filter ? '해당 상태의 주문이 없습니다' : '아직 주문 내역이 없어요'}
            </p>
            <p style={{ fontSize: 14, color: ink3, margin: '0 0 28px' }}>
              {filter ? '다른 필터를 선택해 보세요.' : '마음에 드는 제품을 찾아보세요.'}
            </p>
            <button onClick={() => navigate('/')}
              style={{
                background: cta, color: '#fff', border: 'none',
                borderRadius: 980, padding: '12px 28px',
                fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
              }}>
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order, i) => (
              <div
                key={order._id}
                className="orders-anim"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <OrderCard
                  order={order}
                  onClick={() => navigate(`/order-complete/${order._id}`)}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── 페이지네이션 ── */}
        {!loading && pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${divider}`,
                background: page === 1 ? bg2 : '#fff',
                color: page === 1 ? ink3 : ink,
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                display: 'grid', placeItems: 'center',
                fontFamily: 'inherit',
              }}>
              <IcoChevL />
            </button>

            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, i) =>
                p === '…' ? (
                  <span key={`ellipsis-${i}`} style={{ color: ink3, fontSize: 14, padding: '0 4px' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: p === page ? 'none' : `1px solid ${divider}`,
                      background: p === page ? ink : '#fff',
                      color: p === page ? '#fff' : ink,
                      cursor: 'pointer', fontSize: 14, fontWeight: p === page ? 600 : 400,
                      fontFamily: 'inherit',
                      display: 'grid', placeItems: 'center',
                    }}>
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${divider}`,
                background: page === pagination.pages ? bg2 : '#fff',
                color: page === pagination.pages ? ink3 : ink,
                cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
                display: 'grid', placeItems: 'center',
                fontFamily: 'inherit',
              }}>
              <IcoChevR />
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `0.5px solid ${divider}`, background: bg2, padding: '28px 32px', textAlign: 'center' }}>
        <p style={{ color: ink3, fontSize: 12, margin: 0 }}>
          © 2026 ReApple. Apple 및 Apple 로고는 Apple Inc.의 상표입니다.
        </p>
      </footer>
    </div>
  )
}
