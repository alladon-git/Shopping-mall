import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

/* ── Formatting ── */
const won = (n) => '₩' + Number(n || 0).toLocaleString('ko-KR')

/* ── Icons ── */
const Icon = ({ children, size = 18, stroke = 1.6, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
)
const IconSearch  = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>
const IconBag     = (p) => <Icon {...p}><path d="M6 7h12l-1 13H7L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></Icon>
const IconMenu    = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16"/></Icon>
const IconX       = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18"/></Icon>
const IconArrow   = (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>
const IconChev    = (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>

/* ── Apple logo SVG ── */
const AppleLogo = ({ size = 20 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 20 24" fill="#1D1D1F">
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Product illustrations ── */
const Illo = {
  Mac: ({ accent = '#1D1D1F' }) => (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="300" fill="#F5F5F7"/>
      <g transform="translate(80 70)">
        <rect x="0" y="0" width="240" height="150" rx="10" fill="#1D1D1F"/>
        <rect x="8" y="8" width="224" height="134" rx="4" fill="#0a0a0c"/>
        <rect x="20" y="20" width="60" height="40" rx="4" fill={accent} opacity="0.85"/>
        <rect x="86" y="20" width="126" height="6" rx="3" fill="#3a3a3c"/>
        <rect x="86" y="34" width="90" height="6" rx="3" fill="#3a3a3c"/>
        <rect x="86" y="48" width="110" height="6" rx="3" fill="#3a3a3c"/>
        <rect x="20" y="72" width="192" height="50" rx="6" fill="#2a2a2c"/>
        <path d="M-12 150 H252 L242 168 H-2 Z" fill="#C8C8CC"/>
        <rect x="105" y="150" width="30" height="4" rx="2" fill="#9b9ba0"/>
      </g>
    </svg>
  ),
  iPhone: ({ accent = '#1D1D1F' }) => (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="300" fill="#F5F5F7"/>
      <g transform="translate(160 40)">
        <rect x="0" y="0" width="80" height="220" rx="18" fill={accent}/>
        <rect x="4" y="4" width="72" height="212" rx="14" fill="#0a0a0c"/>
        <rect x="30" y="9" width="20" height="6" rx="3" fill="#1D1D1F"/>
        <rect x="10" y="22" width="60" height="80" rx="6" fill="#222"/>
        <circle cx="40" cy="62" r="14" fill="#444"/>
      </g>
      <g transform="translate(70 80)">
        <rect x="0" y="0" width="70" height="170" rx="14" fill="#E8E8ED"/>
        <rect x="4" y="4" width="62" height="162" rx="10" fill="#FFFFFF"/>
        <rect x="14" y="20" width="42" height="42" rx="8" fill={accent} opacity="0.15"/>
        <rect x="14" y="70" width="42" height="6" rx="3" fill="#D2D2D7"/>
        <rect x="14" y="82" width="30" height="6" rx="3" fill="#D2D2D7"/>
      </g>
    </svg>
  ),
  iPad: ({ accent = '#1D1D1F' }) => (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="300" fill="#F5F5F7"/>
      <g transform="translate(95 40)">
        <rect x="0" y="0" width="210" height="220" rx="14" fill="#1D1D1F"/>
        <rect x="6" y="6" width="198" height="208" rx="8" fill="#FFFFFF"/>
        <rect x="18" y="20" width="60" height="60" rx="8" fill={accent} opacity="0.15"/>
        <rect x="86" y="20" width="100" height="8" rx="4" fill="#1D1D1F"/>
        <rect x="86" y="36" width="80" height="6" rx="3" fill="#D2D2D7"/>
        <rect x="86" y="50" width="90" height="6" rx="3" fill="#D2D2D7"/>
        <rect x="86" y="64" width="60" height="6" rx="3" fill="#D2D2D7"/>
        <rect x="18" y="100" width="168" height="44" rx="6" fill="#F5F5F7"/>
        <rect x="18" y="156" width="80" height="44" rx="6" fill={accent} opacity="0.9"/>
        <rect x="106" y="156" width="80" height="44" rx="6" fill="#F5F5F7"/>
      </g>
    </svg>
  ),
  Watch: ({ accent = '#1D1D1F' }) => (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="300" fill="#F5F5F7"/>
      <g transform="translate(150 30)">
        <rect x="20" y="0" width="60" height="40" rx="14" fill="#C8C8CC"/>
        <rect x="20" y="200" width="60" height="40" rx="14" fill="#C8C8CC"/>
        <rect x="0" y="40" width="100" height="160" rx="26" fill={accent}/>
        <rect x="6" y="46" width="88" height="148" rx="22" fill="#0a0a0c"/>
        <text x="50" y="105" textAnchor="middle" fill="#FFFFFF"
          fontFamily="SF Pro Display,-apple-system,sans-serif" fontSize="34" fontWeight="600">10:09</text>
        <circle cx="30" cy="135" r="10" fill="#FF3B30"/>
        <circle cx="50" cy="135" r="10" fill="#34C759"/>
        <circle cx="70" cy="135" r="10" fill="#0071E3"/>
        <rect x="20" y="160" width="60" height="22" rx="6" fill="#1c1c1e"/>
      </g>
    </svg>
  ),
  AirPods: ({ accent = '#1D1D1F' }) => (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="300" fill="#F5F5F7"/>
      <g transform="translate(130 80)">
        <rect x="0" y="20" width="140" height="100" rx="50" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="1"/>
        <circle cx="40" cy="70" r="14" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="1"/>
        <circle cx="100" cy="70" r="14" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="1"/>
        <rect x="36" y="80" width="8" height="50" rx="4" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="1"/>
        <rect x="96" y="80" width="8" height="50" rx="4" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="1"/>
      </g>
    </svg>
  ),
  Accessories: ({ accent = '#1D1D1F' }) => (
    <svg viewBox="0 0 400 300" style={{ width: '100%', height: '100%' }}>
      <rect width="400" height="300" fill="#F5F5F7"/>
      <g transform="translate(140 100)">
        <circle cx="60" cy="50" r="48" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="1"/>
        <circle cx="60" cy="50" r="32" fill="#F5F5F7"/>
        <circle cx="60" cy="50" r="6" fill={accent}/>
        <rect x="50" y="-4" width="20" height="10" rx="3" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="1"/>
      </g>
    </svg>
  ),
}

/* ── Products ── */
const CATEGORIES = ['전체', 'Mac', 'iPhone', 'iPad', 'Watch', 'AirPods', 'Accessories']

/* 클라이언트 카테고리명 → 서버 enum 변환 */
const CAT_TO_API = { Watch: 'Apple Watch' }
const toApiCat = (cat) => CAT_TO_API[cat] || cat

/* Illo 키 조회 (서버에서 'Apple Watch'로 오면 'Watch'로 매핑) */
const toIlloKey = (cat) => cat === 'Apple Watch' ? 'Watch' : cat

/* ── Styles shared ── */
const S = {
  micro: { fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' },
  ink:  '#1D1D1F',
  ink2: '#6E6E73',
  ink3: '#AEAEB2',
  cta:  '#0071E3',
  bg2:  '#F5F5F7',
  divider: '#D2D2D7',
}

/* ── Product Card ── */
function ProductCard({ p, index, big = false, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  const IlloComp = Illo[toIlloKey(p.category)] || Illo.Accessories

  return (
    <article
      onClick={() => onNavigate && onNavigate(p)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: big ? 'span 2' : undefined,
        gridRow: big ? 'span 2' : undefined,
        background: '#FFFFFF',
        cursor: 'pointer',
        padding: big ? '28px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.3s cubic-bezier(.2,.7,.2,1), box-shadow 0.3s cubic-bezier(.2,.7,.2,1)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 24px 60px -20px rgba(0,0,0,0.18)' : 'none',
        animationName: 'fadeUp',
        animationDuration: '0.7s',
        animationTimingFunction: 'cubic-bezier(.2,.7,.2,1)',
        animationFillMode: 'both',
        animationDelay: `${(index % 8) * 0.05}s`,
      }}
    >
      {/* Top row: category badge + SKU */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          height: 22, padding: '0 10px', borderRadius: 980,
          background: S.bg2, color: S.ink2,
          ...S.micro,
        }}>
          {p.category}
        </span>
        <span style={{ ...S.micro, color: S.ink3 }}>{p.sku}</span>
      </div>

      {/* Image */}
      <div style={{
        margin: big ? '24px 0' : '20px 0',
        borderRadius: 12,
        overflow: 'hidden',
        aspectRatio: big ? '16/10' : '4/3',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.5s cubic-bezier(.2,.7,.2,1)',
        background: S.bg2,
      }}>
        {p.images && p.images.length > 0 ? (
          <img
            src={p.images[0]}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <IlloComp accent={p.color} />
        )}
      </div>

      {/* Info */}
      <div style={{ marginTop: 'auto' }}>
        <h3 style={{
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: big ? 28 : 19,
          fontWeight: 600,
          letterSpacing: '-0.022em',
          margin: 0,
          lineHeight: big ? 1.15 : 1.25,
          color: S.ink,
        }}>
          {p.name}
        </h3>
        {big && p.tagline && (
          <p style={{ margin: '8px 0 0', color: S.ink2, fontSize: 15, lineHeight: 1.5 }}>
            {p.tagline}
          </p>
        )}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <span style={{ color: S.ink, fontSize: 17, fontWeight: 500 }}>
            {won(p.price)}<span style={{ color: S.ink3, fontSize: 13, marginLeft: 4 }}>부터</span>
          </span>
          <span style={{
            color: S.cta, fontSize: 14,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s',
          }}>
            구매하기 <IconArrow size={12} stroke={2.5} />
          </span>
        </div>
      </div>
    </article>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ borderTop: `0.5px solid ${S.divider}`, background: S.bg2 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {[
            ['쇼핑하기',  ['Mac', 'iPhone', 'iPad', 'Watch', 'AirPods']],
            ['서비스',    ['배송 안내', '반품 정책', 'AppleCare+', '교환 및 환불']],
            ['회사',      ['브랜드 소개', '매장 찾기', '채용', '보도자료']],
            ['고객지원',  ['문의하기', 'FAQ', '내 주문', '사업자 등록']],
          ].map(([title, items]) => (
            <div key={title}>
              <p style={{ ...S.micro, color: S.ink2, margin: '0 0 16px' }}>{title}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((it) => (
                  <li key={it}>
                    <a style={{ color: S.ink, fontSize: 13, textDecoration: 'none', transition: 'color 0.15s', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.target.style.color = S.ink2}
                      onMouseLeave={(e) => e.target.style.color = S.ink}>
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `0.5px solid ${S.divider}`, marginTop: 48, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ color: S.ink2, fontSize: 12, margin: 0 }}>
            © 2026 ReApple. Apple, the Apple logo, MacBook, iPhone, iPad, Apple Watch, and AirPods are trademarks of Apple Inc.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['개인정보처리방침', '이용약관', '법적 고지'].map((t) => (
              <a key={t} style={{ color: S.ink2, fontSize: 12, textDecoration: 'none', cursor: 'pointer' }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Main Component ── */
export default function HomePage() {
  const navigate = useNavigate()
  const { token, user, setUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(!!token && !user)
  const [activeCat, setActiveCat] = useState('전체')
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const shopRef = useRef(null)

  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    if (user)   { setLoading(false); return }
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) { setCartCount(0); return }
    api.get('/cart')
      .then(({ data }) => setCartCount(data.totalItems ?? 0))
      .catch(() => {})
  }, [token])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setProductsLoading(true)
    const params = { limit: 100 }
    if (activeCat !== '전체') params.category = toApiCat(activeCat)
    api.get('/products', { params })
      .then(({ data }) => {
        setProducts(data.products)
        setTotal(data.pagination.total)
      })
      .catch(() => {})
      .finally(() => setProductsLoading(false))
  }, [activeCat])

  const handleLogout = () => { logout(); navigate('/login') }
  const scrollToShop = () => shopRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ margin: 0, padding: 0, background: '#FFFFFF', color: S.ink,
      fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
      fontSize: 17, lineHeight: 1.45, WebkitFontSmoothing: 'antialiased' }}>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blurIn { from { opacity:0; filter:blur(8px); } to { opacity:1; filter:blur(0); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .blurin { animation: blurIn 0.9s cubic-bezier(.2,.7,.2,1) both; }
        .grid-hair { background-color: #D2D2D7; }
        .grid-hair > * { background-color: #FFFFFF; }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        .marquee-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 16px 40px -12px rgba(0,0,0,0.16) !important; }
        @media (max-width: 768px) {
          .home-hero-h1 { font-size: 56px !important; }
          .home-grid { grid-template-columns: repeat(2,1fr) !important; }
          .home-grid > [style*="span 2"] { grid-column: span 1 !important; grid-row: span 1 !important; }
          .home-footer-grid { grid-template-columns: repeat(2,1fr) !important; }
          .home-nav-desktop { display: none !important; }
        }
        @media (max-width: 480px) {
          .home-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, width: '100%',
        height: 48,
        background: scrolled ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.85)',
        backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'saturate(180%) blur(10px)',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'saturate(180%) blur(10px)',
        boxShadow: 'inset 0 -0.5px 0 #D2D2D7',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <button
            onClick={() => { setActiveCat('전체'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit' }}
          >
            <AppleLogo size={20} />
            <span style={{
              fontFamily: '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif',
              fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', color: S.ink,
            }}>ReApple</span>
          </button>

          {/* Nav desktop */}
          <nav className="home-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {CATEGORIES.slice(1).map((cat) => (
              <button key={cat} onClick={() => { setActiveCat(cat); scrollToShop() }}
                style={{ background: 'none', border: 0, padding: 0, color: S.ink, fontSize: 13, cursor: 'pointer', letterSpacing: '-0.01em', fontFamily: 'inherit', transition: 'color 0.15s' }}
                onMouseEnter={(e) => e.target.style.color = S.ink2}
                onMouseLeave={(e) => e.target.style.color = S.ink}>
                {cat}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button style={{ background: 'none', border: 0, padding: 0, color: S.ink, cursor: 'pointer', display: 'inline-flex' }} aria-label="검색">
              <IconSearch size={16} />
            </button>
            <button
              onClick={() => navigate('/cart')}
              aria-label="장바구니"
              style={{ background: 'none', border: 0, padding: 0, color: S.ink, cursor: 'pointer', display: 'inline-flex', position: 'relative' }}>
              <IconBag size={16} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -7,
                  minWidth: 16, height: 16, borderRadius: 980,
                  background: S.cta, color: '#fff',
                  fontSize: 10, fontWeight: 700, lineHeight: '16px',
                  textAlign: 'center', padding: '0 4px',
                  pointerEvents: 'none',
                }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth / 관리자 */}
            {loading ? (
              <span style={{ fontSize: 12, color: S.ink3 }}>…</span>
            ) : token && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0071E3, #34C759)',
                    color: '#fff', display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                  }}>{user.name?.charAt(0)}</div>
                  <span style={{ fontSize: 13, color: S.ink, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
                    <strong>{user.name}</strong>님
                  </span>
                </div>
                <button onClick={handleLogout} style={{ background: 'none', border: 0, padding: 0, fontSize: 12, color: S.ink3, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => e.target.style.color = S.ink2}
                  onMouseLeave={(e) => e.target.style.color = S.ink3}>
                  로그아웃
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Link to="/login" style={{ color: S.ink, fontSize: 13, textDecoration: 'none', letterSpacing: '-0.01em' }}>로그인</Link>
                <Link to="/register" style={{
                  background: S.cta, color: '#fff', fontSize: 13,
                  padding: '5px 14px', borderRadius: 980, textDecoration: 'none',
                  letterSpacing: '-0.005em', whiteSpace: 'nowrap',
                }}>회원가입</Link>
              </div>
            )}

            <button
              onClick={() => navigate('/admin/stats')}
              style={{ background: 'none', border: 0, padding: 0, fontSize: 13, color: S.ink, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}
              className="home-nav-desktop">
              관리자
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 0, padding: 0, color: S.ink, cursor: 'pointer', display: 'none' }}
              className="home-menu-btn"
              aria-label="메뉴">
              <IconMenu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile sheet */}
      {mobileMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ height: 48, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'inset 0 -0.5px 0 #D2D2D7' }}>
            <span style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 18, fontWeight: 600 }}>메뉴</span>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 0, cursor: 'pointer', color: S.ink }}><IconX size={20} /></button>
          </div>
          <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {CATEGORIES.slice(1).map((cat) => (
              <button key={cat}
                style={{ background: 'none', border: 0, padding: 0, textAlign: 'left', fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: S.ink, cursor: 'pointer' }}
                onClick={() => { setActiveCat(cat); setMobileMenuOpen(false); scrollToShop() }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{ background: '#FFFFFF', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px 96px', textAlign: 'center' }}>
          <p className="blurin" style={{ ...S.micro, color: S.cta, margin: '0 0 20px', animationDelay: '0.05s' }}>
            2026 SPRING · OFFICIAL RESELLER
          </p>
          <h1 className="blurin home-hero-h1"
            style={{
              fontFamily: '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif',
              fontSize: 112, fontWeight: 600, letterSpacing: '-0.022em', lineHeight: 0.95,
              margin: '0 0 28px', color: S.ink, animationDelay: '0.15s',
            }}>
            다시,<br/>애플.
          </h1>
          <p className="blurin" style={{ color: S.ink2, fontSize: 21, lineHeight: 1.5, maxWidth: 640, margin: '0 auto 36px', animationDelay: '0.3s' }}>
            비공식 리셀러가 엄선한 새 제품과 인증 리퍼브.<br/>
            가장 가까운 데서, 가장 정직한 가격으로.
          </p>
          <div className="blurin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, animationDelay: '0.45s' }}>
            <button onClick={scrollToShop}
              style={{ background: S.cta, color: '#fff', border: 0, padding: '12px 22px', borderRadius: 980, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'filter 0.15s' }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.08)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}>
              지금 쇼핑하기 <IconArrow size={14} stroke={2} />
            </button>
            <button onClick={scrollToShop}
              style={{ background: 'transparent', color: S.cta, border: 0, padding: '12px 22px', borderRadius: 980, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>
              더 알아보기 <IconChev size={12} stroke={2.5} />
            </button>
          </div>

        </div>
      </section>

      {/* ── Hero marquee ── */}
      {products.length > 0 && (
        <div style={{ overflow: 'hidden', width: '100%', background: '#FAFAFA', borderTop: '0.5px solid #D2D2D7', borderBottom: '0.5px solid #D2D2D7', padding: '28px 0' }}>
          <div className="marquee-track" style={{ display: 'flex', gap: 16, width: 'max-content' }}>
            {[...products, ...products].map((p, i) => {
              const IlloComp = Illo[toIlloKey(p.category)] || Illo.Accessories
              return (
                <div key={`${p._id}-${i}`} className="marquee-card"
                  onClick={() => navigate(`/product/${p._id}`)}
                  style={{
                    width: 220, flexShrink: 0, borderRadius: 14,
                    background: '#fff', boxShadow: '0 0 0 0.5px #D2D2D7',
                    overflow: 'hidden', cursor: 'pointer',
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                  }}>
                  <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden' }}>
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <IlloComp accent={p.color} />}
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: S.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: S.cta }}>{won(p.salePrice)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Filter strip (sticky) ── */}
      <div ref={shopRef} id="shop" style={{
        position: 'sticky', top: 48, zIndex: 40,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: 'inset 0 -0.5px 0 #D2D2D7',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 32px' }}>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCat(cat)}
                style={{
                  flexShrink: 0,
                  background: activeCat === cat ? S.ink : S.bg2,
                  color: activeCat === cat ? '#fff' : S.ink,
                  border: 0,
                  height: 36, padding: '0 16px', borderRadius: 980,
                  fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: '-0.01em',
                  transition: 'background 0.18s, color 0.18s',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product section heading ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ ...S.micro, color: S.ink2, margin: '0 0 8px' }}>
              {activeCat === '전체' ? 'ALL PRODUCTS' : activeCat.toUpperCase()}
            </p>
            <h2 style={{
              fontFamily: '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif',
              fontSize: 40, fontWeight: 600, letterSpacing: '-0.022em',
              margin: 0, color: S.ink, lineHeight: 1.1,
            }}>
              {activeCat === '전체' ? '모두를 위한 라인업.' : `${activeCat}을 위한 모든 것.`}
            </h2>
          </div>
          <p style={{ color: S.ink2, fontSize: 14 }}>총 {total}개의 제품</p>
        </div>
      </div>

      {/* ── Asymmetric product grid ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 96px' }}>
        <div className="grid-hair home-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoFlow: 'dense',
          gap: 1,
          borderRadius: 0,
        }}>
          {productsLoading && (
            <div style={{ gridColumn: '1/-1', background: '#fff', padding: '96px 32px', textAlign: 'center' }}>
              <p style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 17, color: S.ink3 }}>
                불러오는 중…
              </p>
            </div>
          )}
          {!productsLoading && products.length === 0 && (
            <div style={{ gridColumn: '1/-1', background: '#fff', padding: '96px 32px', textAlign: 'center' }}>
              <p style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 22, color: S.ink2 }}>
                해당 카테고리에 제품이 없습니다.
              </p>
            </div>
          )}
          {!productsLoading && products.map((p, i) => (
            <ProductCard key={p._id || p.sku} p={p} index={i} big={products.length >= 8 && i % 7 === 0} onNavigate={(prod) => navigate(`/products/${prod._id}`)} />
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
