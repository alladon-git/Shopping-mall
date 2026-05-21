import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

/* ── Tokens ── */
const ink     = '#1D1D1F'
const ink2    = '#6E6E73'
const ink3    = '#AEAEB2'
const cta     = '#0071E3'
const divider = '#D2D2D7'
const bg2     = '#F5F5F7'
const success = '#34C759'
const danger  = '#FF3B30'

const won = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR')

const STATUS_LABEL = {
  pending:   { text: '주문 접수',  color: '#FF9500' },
  confirmed: { text: '결제 완료', color: success },
  shipped:   { text: '배송 중',   color: cta },
  delivered: { text: '배송 완료', color: success },
  cancelled: { text: '취소됨',    color: danger },
  refunded:  { text: '환불 완료', color: ink3 },
}

const PAY_METHOD_LABEL = { card: '신용·체크카드', bank_transfer: '계좌이체', kakao_pay: '카카오페이' }

/* ── Icons ── */
const Svg = ({ size = 20, stroke = 1.6, fill = 'none', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const IcoHome    = () => <Svg size={15} stroke={2}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Svg>
const IcoOrders  = () => <Svg size={15} stroke={2}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></Svg>
const IcoTruck   = () => <Svg size={18} stroke={1.5}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></Svg>
const IcoCard    = () => <Svg size={18} stroke={1.5}><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></Svg>
const IcoPin     = () => <Svg size={18} stroke={1.5}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Svg>

const AppleLogo = () => (
  <svg width={16} height={19} viewBox="0 0 20 24" fill={ink}>
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── 색종이 조각 ── */
const CONFETTI_COLORS = ['#0071E3','#34C759','#FF9500','#FF3B30','#AF52DE','#FF2D55','#5AC8FA']

function Confetti() {
  const pieces = Array.from({ length: 48 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left:  `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${1.2 + Math.random() * 1.4}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }))
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: 'absolute', top: '-20px', left: p.left,
          width: p.size, height: p.size,
          background: p.color, borderRadius: '2px',
          transform: `rotate(${p.rotate})`,
          animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          opacity: 0.85,
        }} />
      ))}
    </div>
  )
}

/* ── 진행 단계 ── */
function ProgressStep({ step, label, active, done }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: done ? success : active ? cta : bg2,
        border: `2px solid ${done ? success : active ? cta : divider}`,
        display: 'grid', placeItems: 'center',
        color: done || active ? '#fff' : ink3,
        fontSize: 13, fontWeight: 600,
        transition: 'all 0.3s',
      }}>
        {done ? <Svg size={14} stroke={2.5}><path d="m5 12 5 5 9-11"/></Svg> : step}
      </div>
      <span style={{ fontSize: 11, color: active || done ? ink : ink3, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </div>
  )
}

/* ── 메인 ── */
export default function OrderCompletePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  /* 주문 완료 후 3초 뒤에 confetti 제거 */
  const [showConfetti, setShowConfetti] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3200)
    return () => clearTimeout(t)
  }, [])

  const statusInfo = order ? (STATUS_LABEL[order.status] ?? { text: order.status, color: ink2 }) : null

  return (
    <div style={{
      minHeight: '100vh', background: '#fff', color: ink,
      fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
      fontSize: 17, lineHeight: 1.45, WebkitFontSmoothing: 'antialiased',
      position: 'relative',
    }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,199,89,0.4); }
          50%       { box-shadow: 0 0 0 16px rgba(52,199,89,0); }
        }
        .step-line::before {
          content: '';
          position: absolute;
          top: 15px; left: calc(50% + 24px);
          width: calc(100% - 48px);
          height: 2px;
          background: #D2D2D7;
          z-index: 0;
        }
        @media(max-width: 640px) {
          .complete-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {showConfetti && <Confetti />}

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
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}>
            <AppleLogo />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>ReApple</span>
          </button>
          <span style={{ fontSize: 13, color: ink3 }}>주문 완료</span>
        </div>
      </header>

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: 'calc(100vh - 48px)', color: ink3 }}>
          불러오는 중…
        </div>
      ) : order && (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 96px', position: 'relative', zIndex: 1 }}>

          {/* ── 성공 아이콘 + 헤드라인 ── */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: success, margin: '0 auto 24px',
              display: 'grid', placeItems: 'center',
              animation: 'popIn 0.6s cubic-bezier(.2,.9,.3,1.2) both, pulse 2s 0.8s ease-in-out 3',
            }}>
              <svg width={40} height={40} viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5 9-11"/>
              </svg>
            </div>

            <h1 style={{
              fontFamily: '"SF Pro Display",-apple-system,sans-serif',
              fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em',
              margin: '0 0 12px', color: ink,
              animation: 'fadeUp 0.5s 0.3s cubic-bezier(.2,.7,.2,1) both',
            }}>
              주문이 완료됐습니다! 🎉
            </h1>
            <p style={{ color: ink2, fontSize: 17, margin: '0 0 6px', animation: 'fadeUp 0.5s 0.45s cubic-bezier(.2,.7,.2,1) both' }}>
              주문번호 <strong style={{ color: ink, letterSpacing: '0.01em' }}>{order.orderNumber}</strong>
            </p>
            <p style={{ color: ink3, fontSize: 14, margin: 0, animation: 'fadeUp 0.5s 0.55s cubic-bezier(.2,.7,.2,1) both' }}>
              {new Date(order.createdAt).toLocaleString('ko-KR', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
            </p>
          </div>

          {/* ── 배송 진행 단계 ── */}
          <div style={{
            background: bg2, borderRadius: 20, padding: '28px 32px',
            marginBottom: 24,
            animation: 'fadeUp 0.5s 0.6s cubic-bezier(.2,.7,.2,1) both',
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: ink2, margin: '0 0 20px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              배송 현황
            </p>
            <div style={{ display: 'flex', position: 'relative' }}>
              {[
                { step: 1, label: '주문 접수',  key: 'pending' },
                { step: 2, label: '결제 완료', key: 'confirmed' },
                { step: 3, label: '배송 중',   key: 'shipped' },
                { step: 4, label: '배송 완료', key: 'delivered' },
              ].map((s, i, arr) => {
                const statusOrder = ['pending','confirmed','shipped','delivered']
                const currentIdx  = statusOrder.indexOf(order.status)
                const stepIdx     = statusOrder.indexOf(s.key)
                const done   = stepIdx < currentIdx
                const active = stepIdx === currentIdx
                return (
                  <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
                    {i < arr.length - 1 && (
                      <div style={{
                        position: 'absolute', top: 15, left: '50%', width: '100%', height: 2,
                        background: done ? success : divider,
                        transition: 'background 0.3s',
                        zIndex: 0,
                      }} />
                    )}
                    <ProgressStep step={s.step} label={s.label} active={active} done={done} />
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', borderRadius: 980, padding: '6px 14px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusInfo?.color, display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: statusInfo?.color }}>{statusInfo?.text}</span>
            </div>
          </div>

          {/* ── 주문 상품 + 요약 그리드 ── */}
          <div className="complete-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            {/* 주문 상품 */}
            <div style={{
              background: bg2, borderRadius: 20, padding: '24px',
              animation: 'fadeUp 0.5s 0.7s cubic-bezier(.2,.7,.2,1) both',
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: ink2, margin: '0 0 16px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                주문 상품 ({order.items.length}개)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.items.map((item) => (
                  <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: '#fff', border: `0.5px solid ${divider}`, flexShrink: 0 }}>
                      {item.image
                        ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: divider }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </p>
                      <p style={{ fontSize: 12, color: ink3, margin: '2px 0 0' }}>
                        {won(item.salePrice)} × {item.quantity}
                      </p>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                      {won(item.salePrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `0.5px solid ${divider}`, marginTop: 16, paddingTop: 14 }}>
                {order.pricing.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: danger, marginBottom: 6 }}>
                    <span>할인</span><span>−{won(order.pricing.discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: ink2, marginBottom: 6 }}>
                  <span>배송비</span><span style={{ color: success }}>무료</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>최종 결제금액</span>
                  <span style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
                    {won(order.pricing.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* 배송 + 결제 정보 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 배송지 */}
              <div style={{
                background: bg2, borderRadius: 20, padding: '22px 24px', flex: 1,
                animation: 'fadeUp 0.5s 0.8s cubic-bezier(.2,.7,.2,1) both',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ color: ink2 }}><IcoPin /></span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: ink2, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>배송지</p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{order.shippingAddress.name}</p>
                <p style={{ fontSize: 14, color: ink2, margin: '0 0 2px' }}>{order.shippingAddress.phone}</p>
                <p style={{ fontSize: 13, color: ink3, margin: 0, lineHeight: 1.5 }}>
                  ({order.shippingAddress.zipCode})<br />
                  {order.shippingAddress.street}
                  {order.shippingAddress.detail && ` ${order.shippingAddress.detail}`}
                </p>
              </div>

              {/* 결제 정보 */}
              <div style={{
                background: bg2, borderRadius: 20, padding: '22px 24px',
                animation: 'fadeUp 0.5s 0.9s cubic-bezier(.2,.7,.2,1) both',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span style={{ color: ink2 }}><IcoCard /></span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: ink2, margin: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>결제 정보</p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>
                  {PAY_METHOD_LABEL[order.payment.method] ?? order.payment.method}
                </p>
                {order.payment.paidAt && (
                  <p style={{ fontSize: 13, color: ink3, margin: 0 }}>
                    {new Date(order.payment.paidAt).toLocaleString('ko-KR', { month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })} 결제
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── CTA 버튼 ── */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeUp 0.5s 1s cubic-bezier(.2,.7,.2,1) both',
          }}>
            <button onClick={() => navigate('/orders')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: cta, color: '#fff', border: 'none',
                borderRadius: 980, padding: '13px 28px', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em',
                transition: 'filter 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}>
              <IcoOrders /> 주문 내역 보기
            </button>
            <button onClick={() => navigate('/')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: bg2, color: ink, border: 'none',
                borderRadius: 980, padding: '13px 28px', fontSize: 15, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = divider}
              onMouseLeave={(e) => e.currentTarget.style.background = bg2}>
              <IcoHome /> 쇼핑 계속하기
            </button>
          </div>

        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{ borderTop: `0.5px solid ${divider}`, background: bg2, padding: '28px 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <p style={{ color: ink3, fontSize: 12, margin: 0 }}>
          © 2026 ReApple. Apple 및 Apple 로고는 Apple Inc.의 상표입니다.
        </p>
      </footer>
    </div>
  )
}
