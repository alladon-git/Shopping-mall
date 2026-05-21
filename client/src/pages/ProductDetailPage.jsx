import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

/* ── Tokens ── */
const ink   = '#1D1D1F'
const ink2  = '#6E6E73'
const ink3  = '#AEAEB2'
const cta   = '#0071E3'
const divider = '#D2D2D7'
const bg2   = '#F5F5F7'
const danger = '#FF3B30'
const success = '#34C759'

const won = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR')

/* ── Icons ── */
const Svg = ({ size = 20, stroke = 1.6, fill = 'none', children, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
)
const IcoArrowL   = () => <Svg size={16} stroke={2}><path d="M19 12H5M11 6l-6 6 6 6"/></Svg>
const IcoTruck    = () => <Svg size={28} stroke={1.4}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></Svg>
const IcoReturn   = () => <Svg size={28} stroke={1.4}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></Svg>
const IcoShield   = () => <Svg size={28} stroke={1.4}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>
const IcoBag      = () => <Svg size={14} stroke={2}><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></Svg>
const IcoChevL    = () => <Svg size={16} stroke={2}><path d="m15 18-6-6 6-6"/></Svg>
const IcoChevR    = () => <Svg size={16} stroke={2}><path d="m9 18 6-6-6-6"/></Svg>
const IcoBookmark = () => <Svg size={16} stroke={1.8}><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Svg>
const IcoCheck    = () => <Svg size={14} stroke={2.5}><path d="m5 12 5 5 9-11"/></Svg>
const IcoMinus    = () => <Svg size={14} stroke={2.5}><path d="M5 12h14"/></Svg>
const IcoPlus     = () => <Svg size={14} stroke={2.5}><path d="M12 5v14M5 12h14"/></Svg>
const IcoSpin     = () => <Svg size={16} stroke={2}><path d="M21 12a9 9 0 1 1-6.22-8.56"/></Svg>

const AppleLogo = () => (
  <svg width={16} height={19} viewBox="0 0 20 24" fill={ink}>
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Category pill colors ── */
const CAT_COLOR = {
  Mac:           '#1A73E8',
  iPhone:        '#C5221F',
  iPad:          '#137333',
  'Apple Watch': '#B06000',
  AirPods:       '#6A0DAD',
  Accessories:   '#374151',
}

/* ── Skeleton loader ── */
function Skeleton({ w = '100%', h = 20, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, #f0f0f2 25%, #e0e0e4 50%, #f0f0f2 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, user, setUser, logout } = useAuthStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [mainImg, setMainImg]   = useState(0)
  const [activeTab, setActiveTab] = useState('개요')
  const [qty, setQty]           = useState(1)
  const [adding, setAdding]     = useState(false)
  const [addedDone, setAddedDone] = useState(false)
  const [toast, setToast]       = useState({ msg: '', kind: '', visible: false })

  /* auth */
  useEffect(() => {
    if (!token || user) return
    api.get('/auth/me').then(({ data }) => setUser(data)).catch(() => logout())
  }, [token])

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind, visible: true })
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800)
  }

  const addToCart = async () => {
    if (!token) { navigate('/login'); return }
    setAdding(true)
    try {
      await api.post('/cart', { productId: product._id, quantity: qty })
      setAddedDone(true)
      showToast(`${product.name}을(를) 장바구니에 담았습니다.`)
      setTimeout(() => setAddedDone(false), 2000)
    } catch (err) {
      showToast(err.response?.data?.message || '장바구니 추가에 실패했습니다.', 'error')
    } finally {
      setAdding(false)
    }
  }

  /* fetch product */
  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(({ data }) => { setProduct(data); setMainImg(0) })
      .catch(() => setError('상품을 불러올 수 없습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  const salePrice = product
    ? Math.round(product.price * (1 - (product.discountRate || 0) / 100))
    : 0
  const hasDiscount = product && product.discountRate > 0

  return (
    <div style={{
      margin: 0, padding: 0, background: '#fff', color: ink,
      fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
      fontSize: 17, lineHeight: 1.45, WebkitFontSmoothing: 'antialiased',
      minHeight: '100vh',
    }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .detail-anim { animation: fadeIn 0.5s cubic-bezier(.2,.7,.2,1) both; }
        .thumb-btn:hover { opacity:1 !important; }
        .tab-btn { background:none;border:none;cursor:pointer;font-family:inherit; }
        .cta-btn:hover { filter:brightness(1.08); }
        .back-btn:hover { color: ${ink2} !important; }
        @media(max-width:768px) {
          .detail-layout { flex-direction:column !important; }
          .detail-left  { width:100% !important; position:static !important; }
          .detail-right { width:100% !important; }
          .detail-subnav-name { display:none !important; }
        }
      `}</style>

      {/* ── Global nav ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 60,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: 'inset 0 -0.5px 0 ' + divider,
        height: 44,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={() => navigate('/')}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: ink, fontFamily: 'inherit' }}>
            <AppleLogo />
            <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>ReApple</span>
          </button>
          <button onClick={() => navigate(-1)}
            className="back-btn"
            style={{ background: 'none', border: 0, padding: '0 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: cta, fontSize: 13, fontFamily: 'inherit', transition: 'color 0.15s' }}>
            <IcoChevL /> 스토어
          </button>
        </div>
      </header>

      {/* ── Product sub-nav ── */}
      {product && (
        <div style={{
          position: 'sticky', top: 44, zIndex: 50,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          boxShadow: 'inset 0 -0.5px 0 ' + divider,
          height: 52,
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="detail-subnav-name" style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em' }}>
              {product.name}
            </span>
            <div style={{ display: 'flex', gap: 0 }}>
              {['개요', '제품 사양'].map((tab) => (
                <button key={tab} className="tab-btn"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0 16px', height: 52, fontSize: 13,
                    color: activeTab === tab ? ink : ink2,
                    borderBottom: activeTab === tab ? `2px solid ${ink}` : '2px solid transparent',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.15s',
                  }}>
                  {tab}
                </button>
              ))}
            </div>
            <div /> {/* spacer */}
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ maxWidth: 600, margin: '120px auto', textAlign: 'center', padding: '0 24px' }}>
          <p style={{ color: ink2, fontSize: 17 }}>{error}</p>
          <button onClick={() => navigate('/')}
            style={{ marginTop: 20, background: cta, color: '#fff', border: 0, borderRadius: 980, padding: '10px 22px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
            홈으로
          </button>
        </div>
      )}

      {/* ── Main content ── */}
      {!error && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 80px' }}>
          <div className="detail-layout" style={{ display: 'flex', gap: 64, alignItems: 'flex-start', paddingTop: 48 }}>

            {/* ── LEFT: Image gallery ── */}
            <div className="detail-left" style={{ width: '52%', position: 'sticky', top: 112 }}>
              {loading ? (
                <Skeleton h={480} radius={16} />
              ) : (
                <div className="detail-anim">
                  {/* Main image */}
                  <div style={{
                    borderRadius: 20, overflow: 'hidden',
                    background: bg2, aspectRatio: '4/3',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                  }}>
                    {product.images && product.images.length > 0 ? (
                      <>
                        <img
                          key={mainImg}
                          src={product.images[mainImg]}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', animation: 'fadeIn 0.3s ease both' }}
                        />
                        {/* prev/next arrows if multiple images */}
                        {product.images.length > 1 && (
                          <>
                            <button onClick={() => setMainImg(i => (i - 1 + product.images.length) % product.images.length)}
                              style={{ position:'absolute',left:12,top:'50%',transform:'translateY(-50%)', background:'rgba(255,255,255,0.85)', border:'none', borderRadius:'50%', width:36,height:36, display:'flex',alignItems:'center',justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                              <IcoChevL />
                            </button>
                            <button onClick={() => setMainImg(i => (i + 1) % product.images.length)}
                              style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)', background:'rgba(255,255,255,0.85)', border:'none', borderRadius:'50%', width:36,height:36, display:'flex',alignItems:'center',justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.12)' }}>
                              <IcoChevR />
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div style={{ padding: 40, color: ink3, fontSize: 14, textAlign: 'center' }}>
                        이미지 없음
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {product.images && product.images.length > 1 && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {product.images.map((src, i) => (
                        <button key={i} className="thumb-btn"
                          onClick={() => setMainImg(i)}
                          style={{
                            width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                            border: `2px solid ${i === mainImg ? ink : divider}`,
                            padding: 0, cursor: 'pointer', background: bg2,
                            opacity: i === mainImg ? 1 : 0.65,
                            transition: 'border-color 0.15s, opacity 0.15s',
                          }}>
                          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product info ── */}
            <div className="detail-right" style={{ width: '48%', paddingTop: 8 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Skeleton h={22} w="40%" />
                  <Skeleton h={48} w="85%" />
                  <Skeleton h={18} />
                  <Skeleton h={18} w="70%" />
                </div>
              ) : product && (
                <div className="detail-anim">
                  {/* Category label */}
                  <p style={{
                    fontSize: 13, fontWeight: 600, letterSpacing: '0.02em',
                    color: CAT_COLOR[product.category] || cta,
                    margin: '0 0 10px',
                  }}>
                    {product.category}
                  </p>

                  {/* Product name */}
                  <h1 style={{
                    fontFamily: '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif',
                    fontSize: 40, fontWeight: 600, letterSpacing: '-0.022em', lineHeight: 1.08,
                    margin: '0 0 20px', color: ink,
                  }}>
                    {product.name}<br />
                    <span style={{ fontSize: 32 }}>구입하기</span>
                  </h1>

                  {/* Tagline / Description */}
                  {product.tagline && (
                    <p style={{ color: ink2, fontSize: 17, lineHeight: 1.55, margin: '0 0 8px' }}>
                      {product.tagline}
                    </p>
                  )}
                  {product.description && (
                    <p style={{ color: ink2, fontSize: 15, lineHeight: 1.6, margin: '0 0 28px' }}>
                      {product.description}
                    </p>
                  )}

                  <div style={{ borderTop: `0.5px solid ${divider}`, margin: '28px 0' }} />

                  {/* Features row */}
                  <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
                    {[
                      { icon: <IcoTruck />, label: '무료 배송' },
                      { icon: <IcoReturn />, label: '30일 이내\n무료 반품' },
                      { icon: <IcoShield />, label: '1년 제한 보증' },
                    ].map(({ icon, label }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, textAlign: 'center' }}>
                        <span style={{ color: ink2 }}>{icon}</span>
                        <span style={{ color: ink2, fontSize: 12, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: `0.5px solid ${divider}`, margin: '0 0 28px' }} />

                  {/* SKU + stock */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <span style={{ fontSize: 12, color: ink3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {product.sku}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: product.stock > 0 ? success : danger,
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: product.stock > 0 ? success : danger, display: 'inline-block' }} />
                      {product.stock > 0 ? `재고 ${product.stock}개` : '품절'}
                    </span>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 28 }}>
                    {hasDiscount && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 14, color: ink3, textDecoration: 'line-through' }}>
                          {won(product.price)}
                        </span>
                        <span style={{
                          background: danger, color: '#fff',
                          fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 980,
                        }}>
                          {product.discountRate}% OFF
                        </span>
                      </div>
                    )}
                    <span style={{
                      fontFamily: '"SF Pro Display",-apple-system,sans-serif',
                      fontSize: 36, fontWeight: 600, letterSpacing: '-0.022em', color: ink,
                    }}>
                      {won(hasDiscount ? salePrice : product.price)}
                    </span>
                    <span style={{ fontSize: 14, color: ink3, marginLeft: 6 }}>부터</span>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                      {product.tags.map((tag) => (
                        <span key={tag} style={{
                          background: bg2, color: ink2, fontSize: 12,
                          padding: '4px 12px', borderRadius: 980,
                          letterSpacing: '0.02em',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 수량 선택 */}
                  {product.stock > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 16 }}>
                      <span style={{ fontSize: 14, color: ink2, marginRight: 16, whiteSpace: 'nowrap' }}>수량</span>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={qty <= 1}
                          style={{
                            width: 36, height: 36, border: `0.5px solid ${divider}`,
                            borderRadius: '8px 0 0 8px', background: qty <= 1 ? bg2 : '#fff',
                            cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                            display: 'grid', placeItems: 'center',
                            color: qty <= 1 ? ink3 : ink,
                          }}>
                          <IcoMinus />
                        </button>
                        <div style={{
                          width: 52, height: 36,
                          border: `0.5px solid ${divider}`, borderLeft: 'none', borderRight: 'none',
                          display: 'grid', placeItems: 'center',
                          fontSize: 15, fontWeight: 500, color: ink,
                        }}>
                          {qty}
                        </div>
                        <button
                          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                          disabled={qty >= product.stock}
                          style={{
                            width: 36, height: 36, border: `0.5px solid ${divider}`,
                            borderRadius: '0 8px 8px 0', background: qty >= product.stock ? bg2 : '#fff',
                            cursor: qty >= product.stock ? 'not-allowed' : 'pointer',
                            display: 'grid', placeItems: 'center',
                            color: qty >= product.stock ? ink3 : ink,
                          }}>
                          <IcoPlus />
                        </button>
                        <span style={{ fontSize: 13, color: ink3, marginLeft: 12 }}>
                          최대 {product.stock}개
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={addToCart}
                    disabled={product.stock === 0 || adding}
                    className="cta-btn"
                    style={{
                      width: '100%', height: 52,
                      background: addedDone ? success : product.stock > 0 ? cta : ink3,
                      color: '#fff', border: 0, borderRadius: 12,
                      fontSize: 17, fontWeight: 500,
                      cursor: product.stock > 0 && !adding ? 'pointer' : 'not-allowed',
                      fontFamily: 'inherit', letterSpacing: '-0.01em',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'filter 0.15s, background 0.3s',
                      marginBottom: 12,
                    }}>
                    {adding ? (
                      <span style={{ display: 'inline-flex', animation: 'spin 0.8s linear infinite' }}><IcoSpin /></span>
                    ) : addedDone ? (
                      <><IcoCheck /> 담겼습니다</>
                    ) : (
                      <><IcoBag /> {product.stock > 0 ? '장바구니에 추가' : '품절'}</>
                    )}
                  </button>

                  {/* 장바구니 바로가기 */}
                  {product.stock > 0 && (
                    <button
                      onClick={() => navigate('/cart')}
                      style={{
                        width: '100%', height: 44,
                        background: 'none', border: `0.5px solid ${divider}`, borderRadius: 12,
                        cursor: 'pointer', color: cta, fontSize: 14, fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        marginBottom: 8, transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = bg2}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                      <IcoBag /> 장바구니 보기
                    </button>
                  )}

                  {/* Save for later */}
                  <button style={{
                    width: '100%', height: 44,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: cta, fontSize: 14, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                    <IcoBookmark /> 나중을 위해 저장
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Spec table (제품 사양 tab) ── */}
          {product && activeTab === '제품 사양' && (
            <div className="detail-anim" style={{ marginTop: 64, borderTop: `0.5px solid ${divider}`, paddingTop: 48 }}>
              <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.022em', margin: '0 0 32px' }}>
                제품 사양
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                <tbody>
                  {[
                    ['모델명', product.name],
                    ['SKU', product.sku],
                    ['카테고리', product.category],
                    ['가격', won(product.price)],
                    ...(hasDiscount ? [
                      ['할인율', `${product.discountRate}%`],
                      ['할인가', won(salePrice)],
                    ] : []),
                    ['재고', `${product.stock}개`],
                    ...(product.tags?.length ? [['태그', product.tags.join(', ')]] : []),
                    ...(product.tagline ? [['태그라인', product.tagline]] : []),
                  ].map(([label, value]) => (
                    <tr key={label} style={{ borderBottom: `0.5px solid ${divider}` }}>
                      <td style={{ padding: '16px 0', color: ink2, width: '30%', verticalAlign: 'top', fontSize: 14 }}>{label}</td>
                      <td style={{ padding: '16px 0 16px 24px', color: ink, verticalAlign: 'top' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Toast ── */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: toast.visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(16px)',
        background: toast.kind === 'error' ? danger : success,
        color: '#fff', borderRadius: 980, padding: '11px 20px',
        fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.25)',
        opacity: toast.visible ? 1 : 0, pointerEvents: 'none',
        transition: 'opacity 0.25s, transform 0.3s cubic-bezier(.2,.7,.2,1)',
        zIndex: 90, whiteSpace: 'nowrap',
      }}>
        {toast.kind !== 'error' && <span style={{ display: 'inline-flex' }}><IcoCheck /></span>}
        {toast.msg}
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `0.5px solid ${divider}`, background: bg2, padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: ink2, fontSize: 12, margin: 0 }}>
          © 2026 ReApple. Apple 및 Apple 로고는 Apple Inc.의 상표입니다.
        </p>
      </footer>
    </div>
  )
}
