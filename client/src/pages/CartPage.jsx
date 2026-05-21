import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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

/* ── Icons ── */
const Svg = ({ size = 20, stroke = 1.6, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const IcoChevL  = () => <Svg size={16} stroke={2}><path d="m15 18-6-6 6-6"/></Svg>
const IcoTrash  = () => <Svg size={15} stroke={1.8}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></Svg>
const IcoMinus  = () => <Svg size={14} stroke={2.5}><path d="M5 12h14"/></Svg>
const IcoPlus   = () => <Svg size={14} stroke={2.5}><path d="M12 5v14M5 12h14"/></Svg>
const IcoBag    = () => <Svg size={48} stroke={1.2}><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></Svg>
const IcoCheck  = () => <Svg size={13} stroke={2.5}><path d="m5 12 5 5 9-11"/></Svg>

const AppleLogo = () => (
  <svg width={16} height={19} viewBox="0 0 20 24" fill={ink}>
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Skeleton ── */
function Skeleton({ h = 20, w = '100%', radius = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg,#f0f0f2 25%,#e4e4e8 50%,#f0f0f2 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

/* ── Cart Item Row ── */
function CartItem({ item, onQtyChange, onRemove, updating }) {
  const p = item.product
  const snap = item.priceSnapshot
  const hasDiscount = snap.discountRate > 0

  return (
    <div style={{
      display: 'flex', gap: 20, padding: '24px 0',
      borderBottom: `0.5px solid ${divider}`,
      opacity: updating ? 0.5 : 1,
      transition: 'opacity 0.2s',
    }}>
      {/* Thumbnail */}
      <Link to={`/products/${p._id}`} style={{ flexShrink: 0 }}>
        <div style={{
          width: 100, height: 100, borderRadius: 12,
          background: bg2, overflow: 'hidden',
          border: `0.5px solid ${divider}`,
        }}>
          {p.images?.[0]
            ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: ink3, fontSize: 11 }}>이미지 없음</div>
          }
        </div>
      </Link>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, color: ink3, margin: '0 0 4px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
          {p.category}
        </p>
        <Link to={`/products/${p._id}`} style={{ textDecoration: 'none', color: ink }}>
          <p style={{
            fontFamily: '"SF Pro Display",-apple-system,sans-serif',
            fontSize: 16, fontWeight: 600, margin: '0 0 6px',
            letterSpacing: '-0.015em', lineHeight: 1.3,
          }}>
            {p.name}
          </p>
        </Link>
        <p style={{ fontSize: 12, color: ink3, margin: '0 0 14px' }}>SKU: {p.sku}</p>

        {/* Qty controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <button
            onClick={() => onQtyChange(item._id, item.quantity - 1)}
            disabled={item.quantity <= 1 || updating}
            style={{
              width: 32, height: 32, border: `0.5px solid ${divider}`, borderRadius: '8px 0 0 8px',
              background: item.quantity <= 1 ? bg2 : '#fff', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
              display: 'grid', placeItems: 'center', color: item.quantity <= 1 ? ink3 : ink,
            }}>
            <IcoMinus />
          </button>
          <div style={{
            width: 44, height: 32, border: `0.5px solid ${divider}`, borderLeft: 'none', borderRight: 'none',
            display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 500, color: ink,
          }}>
            {item.quantity}
          </div>
          <button
            onClick={() => onQtyChange(item._id, item.quantity + 1)}
            disabled={item.quantity >= p.stock || updating}
            style={{
              width: 32, height: 32, border: `0.5px solid ${divider}`, borderRadius: '0 8px 8px 0',
              background: item.quantity >= p.stock ? bg2 : '#fff', cursor: item.quantity >= p.stock ? 'not-allowed' : 'pointer',
              display: 'grid', placeItems: 'center', color: item.quantity >= p.stock ? ink3 : ink,
            }}>
            <IcoPlus />
          </button>
        </div>
      </div>

      {/* Price + delete */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          {hasDiscount && (
            <p style={{ fontSize: 12, color: ink3, textDecoration: 'line-through', margin: '0 0 2px' }}>
              {won(snap.price * item.quantity)}
            </p>
          )}
          <p style={{ fontSize: 17, fontWeight: 600, color: ink, margin: 0, letterSpacing: '-0.015em' }}>
            {won(snap.salePrice * item.quantity)}
          </p>
          {item.quantity > 1 && (
            <p style={{ fontSize: 11, color: ink3, margin: '2px 0 0' }}>
              {won(snap.salePrice)} × {item.quantity}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(item._id)}
          disabled={updating}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: ink3, padding: 4, display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = danger}
          onMouseLeave={(e) => e.currentTarget.style.color = ink3}>
          <IcoTrash /> 삭제
        </button>
      </div>
    </div>
  )
}

/* ── Main ── */
export default function CartPage() {
  const navigate = useNavigate()
  const { token, user, setUser, logout } = useAuthStore()

  const [cart, setCart]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast]     = useState({ msg: '', kind: '', visible: false })

  /* auth */
  useEffect(() => {
    if (!token || user) return
    api.get('/auth/me').then(({ data }) => setUser(data)).catch(() => logout())
  }, [token])

  /* fetch cart */
  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get('/cart')
      .then(({ data }) => setCart(data))
      .catch(() => showToast('장바구니를 불러오지 못했습니다.', 'error'))
      .finally(() => setLoading(false))
  }, [token])

  const showToast = (msg, kind = 'info') => {
    setToast({ msg, kind, visible: true })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800)
  }

  const handleQtyChange = async (itemId, qty) => {
    if (qty < 1) return
    setUpdating(true)
    try {
      const { data } = await api.patch(`/cart/${itemId}`, { quantity: qty })
      setCart(data)
    } catch (err) {
      showToast(err.response?.data?.message || '수량 변경에 실패했습니다.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleRemove = async (itemId) => {
    setUpdating(true)
    try {
      const { data } = await api.delete(`/cart/${itemId}`)
      setCart(data)
      showToast('상품을 삭제했습니다.')
    } catch {
      showToast('삭제에 실패했습니다.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleClear = async () => {
    if (!window.confirm('장바구니를 모두 비울까요?')) return
    setUpdating(true)
    try {
      const { data } = await api.delete('/cart')
      setCart({ ...cart, items: [], totalItems: 0, totalPrice: 0, totalDiscount: 0 })
      showToast(data.message)
    } catch {
      showToast('오류가 발생했습니다.', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const items      = cart?.items ?? []
  const totalPrice = cart?.totalPrice ?? 0
  const totalDiscount = cart?.totalDiscount ?? 0
  const shipping   = totalPrice > 0 ? 0 : 0  // 무료배송
  const finalPrice = totalPrice + shipping

  return (
    <div style={{
      margin: 0, padding: 0, background: '#fff', color: ink,
      fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
      fontSize: 17, lineHeight: 1.45, WebkitFontSmoothing: 'antialiased', minHeight: '100vh',
    }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .cart-anim { animation: fadeUp 0.4s cubic-bezier(.2,.7,.2,1) both; }
        @media(max-width:768px) {
          .cart-layout { flex-direction:column !important; }
          .cart-summary { width:100% !important; position:static !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: `inset 0 -0.5px 0 ${divider}`,
        height: 48,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: ink, fontFamily: 'inherit' }}>
            <AppleLogo />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>ReApple</span>
          </button>
          <button onClick={() => navigate(-1)}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: cta, fontSize: 13, fontFamily: 'inherit' }}>
            <IcoChevL /> 계속 쇼핑하기
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 96px' }}>
        <h1 style={{
          fontFamily: '"SF Pro Display",-apple-system,sans-serif',
          fontSize: 40, fontWeight: 600, letterSpacing: '-0.022em',
          margin: '0 0 40px', color: ink,
        }}>
          장바구니
        </h1>

        {/* 비로그인 */}
        {!token && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ color: ink3, marginBottom: 20 }}><IcoBag /></div>
            <p style={{ color: ink2, fontSize: 17, marginBottom: 24 }}>로그인 후 장바구니를 이용할 수 있습니다.</p>
            <Link to="/login" style={{
              background: cta, color: '#fff', textDecoration: 'none',
              padding: '12px 28px', borderRadius: 980, fontSize: 15,
            }}>로그인</Link>
          </div>
        )}

        {/* 로딩 */}
        {token && loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: 24, borderBottom: `0.5px solid ${divider}` }}>
                <Skeleton w={100} h={100} radius={12} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Skeleton h={14} w="30%" />
                  <Skeleton h={18} w="60%" />
                  <Skeleton h={14} w="20%" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 빈 장바구니 */}
        {token && !loading && items.length === 0 && (
          <div className="cart-anim" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ color: ink3, marginBottom: 20, display: 'inline-flex' }}><IcoBag /></div>
            <p style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 22, color: ink2, marginBottom: 8 }}>
              장바구니가 비어있습니다.
            </p>
            <p style={{ color: ink3, fontSize: 15, marginBottom: 28 }}>마음에 드는 상품을 담아보세요.</p>
            <button onClick={() => navigate('/')}
              style={{ background: cta, color: '#fff', border: 'none', borderRadius: 980, padding: '12px 28px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              쇼핑 계속하기
            </button>
          </div>
        )}

        {/* 장바구니 내용 */}
        {token && !loading && items.length > 0 && (
          <div className="cart-anim cart-layout" style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>

            {/* ── Left: item list ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <p style={{ color: ink2, fontSize: 14, margin: 0 }}>
                  총 {cart?.totalItems ?? 0}개의 상품
                </p>
                <button onClick={handleClear} disabled={updating}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: ink3, fontSize: 13, fontFamily: 'inherit', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = danger}
                  onMouseLeave={(e) => e.currentTarget.style.color = ink3}>
                  전체 삭제
                </button>
              </div>

              {items.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onQtyChange={handleQtyChange}
                  onRemove={handleRemove}
                  updating={updating}
                />
              ))}
            </div>

            {/* ── Right: order summary ── */}
            <div className="cart-summary" style={{
              width: 320, flexShrink: 0,
              position: 'sticky', top: 72,
              background: bg2, borderRadius: 16, padding: 28,
            }}>
              <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 20, fontWeight: 600, margin: '0 0 24px', letterSpacing: '-0.015em' }}>
                주문 요약
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: ink2 }}>
                  <span>상품 금액</span>
                  <span>{won(totalPrice + totalDiscount)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: danger }}>
                    <span>할인</span>
                    <span>−{won(totalDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: ink2 }}>
                  <span>배송비</span>
                  <span style={{ color: success, fontWeight: 500 }}>무료</span>
                </div>
              </div>

              <div style={{ borderTop: `0.5px solid ${divider}`, margin: '20px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>총 결제금액</span>
                <span style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>
                  {won(finalPrice)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                style={{
                  width: '100%', height: 50, background: cta, color: '#fff',
                  border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em',
                  transition: 'filter 0.15s', marginBottom: 10,
                }}
                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}>
                결제하기
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {['무료 배송', '30일 이내 무료 반품', '안전한 결제'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: ink2 }}>
                    <span style={{ color: success, display: 'inline-flex' }}><IcoCheck /></span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: toast.visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(16px)',
        background: toast.kind === 'error' ? danger : ink,
        color: '#fff', borderRadius: 980, padding: '11px 20px',
        fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
        opacity: toast.visible ? 1 : 0, pointerEvents: 'none',
        transition: 'opacity 0.25s, transform 0.3s cubic-bezier(.2,.7,.2,1)',
        zIndex: 90, whiteSpace: 'nowrap',
      }}>
        {toast.kind !== 'error' && <span style={{ display: 'inline-flex' }}><IcoCheck /></span>}
        {toast.msg}
      </div>
    </div>
  )
}
