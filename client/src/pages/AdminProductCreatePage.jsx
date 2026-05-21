import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import '../styles/admin.css'

/* ── Design tokens ── */
const ink  = '#1D1D1F'
const ink2 = '#6E6E73'
const ink3 = '#AEAEB2'
const cta  = '#0071E3'
const divider = '#D2D2D7'
const danger  = '#FF3B30'
const success = '#34C759'
const bg2 = '#F5F5F7'

const CATEGORIES = ['Mac', 'iPhone', 'iPad', 'Apple Watch', 'AirPods', 'Accessories']

/* ── SVG Sidebar icons ── */
const IcoPackage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/>
  </svg>
)
const IcoOrders = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7h14l-1 12H4L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>
  </svg>
)
const IcoUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.6"/><path d="M14.5 20a4.6 4.6 0 0 1 6.5-4"/>
  </svg>
)
const IcoStats = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>
  </svg>
)
const IcoChevR = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 6 6 6-6 6"/>
  </svg>
)
const IcoArrowL = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 6l-6 6 6 6"/>
  </svg>
)
const IcoUpload = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 14v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3"/>
    <path d="M7 9 12 4l5 5"/><path d="M12 4v12"/>
  </svg>
)
const IcoFile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3v5h5M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-5Z"/>
  </svg>
)
const IcoX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6l12 12M18 6 6 18"/>
  </svg>
)
const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-11"/>
  </svg>
)

const AppleLogo = () => (
  <svg width="14" height="17" viewBox="0 0 20 24" fill="currentColor">
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Category preview SVG thumbnails ── */
const CATEGORY_ICONS = {
  Mac: (
    <svg viewBox="0 0 72 72">
      <rect x="8" y="16" width="56" height="36" rx="4" fill="#1D1D1F"/>
      <rect x="11" y="19" width="50" height="30" rx="2" fill="#0a0a0c"/>
      <circle cx="36" cy="34" r="9" fill="#0071E3"/>
      <circle cx="36" cy="34" r="4" fill="#34C759"/>
      <path d="M2 52 H70 L66 60 H6 Z" fill="#3a3a3c"/>
    </svg>
  ),
  iPhone: (
    <svg viewBox="0 0 72 72">
      <rect x="24" y="6" width="24" height="58" rx="5" fill="#5e5847"/>
      <rect x="26" y="8" width="20" height="54" rx="4" fill="#0a0a0c"/>
      <rect x="33" y="11" width="6" height="3" rx="1" fill="#1D1D1F"/>
      <rect x="28" y="17" width="16" height="22" rx="3" fill="#1c1c1e"/>
      <circle cx="36" cy="28" r="5" fill="#3a3a3c"/>
    </svg>
  ),
  iPad: (
    <svg viewBox="0 0 72 72">
      <rect x="14" y="8" width="44" height="56" rx="5" fill="#1D1D1F"/>
      <rect x="16" y="10" width="40" height="52" rx="3" fill="#FFFFFF"/>
      <rect x="20" y="14" width="14" height="14" rx="2" fill="#0071E3" opacity="0.2"/>
      <rect x="38" y="16" width="14" height="2" rx="1" fill="#1D1D1F"/>
      <rect x="38" y="22" width="12" height="2" rx="1" fill="#D2D2D7"/>
      <rect x="20" y="34" width="32" height="12" rx="2" fill="#F5F5F7"/>
    </svg>
  ),
  'Apple Watch': (
    <svg viewBox="0 0 72 72">
      <rect x="26" y="4" width="20" height="10" rx="4" fill="#C8C8CC"/>
      <rect x="26" y="58" width="20" height="10" rx="4" fill="#C8C8CC"/>
      <rect x="20" y="14" width="32" height="44" rx="9" fill="#1D1D1F"/>
      <rect x="22" y="16" width="28" height="40" rx="7" fill="#0a0a0c"/>
      <text x="36" y="38" textAnchor="middle" fill="#fff" fontFamily="SF Pro Display,-apple-system" fontSize="9" fontWeight="600">10:09</text>
    </svg>
  ),
  AirPods: (
    <svg viewBox="0 0 72 72">
      <rect x="14" y="26" width="44" height="22" rx="11" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/>
      <circle cx="26" cy="36" r="5" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/>
      <circle cx="46" cy="36" r="5" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/>
      <rect x="24" y="40" width="4" height="14" rx="2" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/>
      <rect x="44" y="40" width="4" height="14" rx="2" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/>
    </svg>
  ),
  Accessories: (
    <svg viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="22" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.8"/>
      <circle cx="36" cy="36" r="14" fill="#F5F5F7"/>
      <circle cx="36" cy="36" r="4" fill="#1D1D1F"/>
    </svg>
  ),
}

const PlaceholderIcon = () => (
  <svg viewBox="0 0 72 72">
    <rect x="8" y="20" width="56" height="32" rx="4" fill="#D2D2D7"/>
    <rect x="12" y="24" width="48" height="24" rx="2" fill="#E8E8ED"/>
    <path d="M2 52 H70 L66 60 H6 Z" fill="#D2D2D7"/>
  </svg>
)

const CAT_PILL_STYLE = {
  Mac:           { bg: '#E8F0FE', color: '#1A73E8' },
  iPhone:        { bg: '#FCE8E6', color: '#C5221F' },
  iPad:          { bg: '#E6F4EA', color: '#137333' },
  'Apple Watch': { bg: '#FEF7E0', color: '#B06000' },
  AirPods:       { bg: '#F3E8FD', color: '#6A0DAD' },
  Accessories:   { bg: '#F3F4F6', color: '#374151' },
}

/* ── Toast ── */
function Toast({ msg, kind, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
      background: ink, color: '#fff', borderRadius: 980,
      padding: '11px 18px 11px 14px', fontSize: 13,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
      opacity: visible ? 1 : 0, pointerEvents: 'none',
      transition: 'opacity 0.25s, transform 0.3s cubic-bezier(.2,.7,.2,1)',
      zIndex: 90, letterSpacing: '-0.005em', whiteSpace: 'nowrap',
    }}>
      {kind === 'success' && (
        <span style={{ color: success, display: 'inline-flex' }}><IcoCheck /></span>
      )}
      {msg}
    </div>
  )
}

/* ── Field component ── */
function Field({ label, required, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <span style={{ display: 'block', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2, marginBottom: 6, fontWeight: 500 }}>
        {label}{required && <span style={{ color: danger, marginLeft: 2 }}>*</span>}
      </span>
      {children}
      {error && (
        <p style={{ fontSize: 12, color: danger, margin: '6px 0 0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{error}</p>
      )}
      {!error && hint && (
        <p style={{ fontSize: 12, color: ink2, margin: '6px 0 0' }}>{hint}</p>
      )}
    </div>
  )
}

const inputBase = {
  width: '100%', height: 42, padding: '10px 14px',
  borderRadius: 8, border: 0,
  boxShadow: `inset 0 0 0 0.5px ${divider}`,
  background: '#fff', color: ink,
  fontSize: 14, outline: 'none',
  letterSpacing: '-0.005em', fontFamily: 'inherit',
  transition: 'box-shadow 0.15s ease',
  boxSizing: 'border-box',
}

function Input({ error, style, ...props }) {
  return (
    <input
      style={{ ...inputBase, ...(error ? { boxShadow: `inset 0 0 0 1px ${danger}, 0 0 0 3px rgba(255,59,48,0.12)` } : {}), ...style }}
      onFocus={e => { if (!error) e.target.style.boxShadow = `inset 0 0 0 1px ${cta}, 0 0 0 3px rgba(0,113,227,0.18)` }}
      onBlur={e => { e.target.style.boxShadow = error ? `inset 0 0 0 1px ${danger}, 0 0 0 3px rgba(255,59,48,0.12)` : `inset 0 0 0 0.5px ${divider}` }}
      {...props}
    />
  )
}

function Select({ children, error, ...props }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        style={{ ...inputBase, appearance: 'none', paddingRight: 36, cursor: 'pointer', ...(error ? { boxShadow: `inset 0 0 0 1px ${danger}` } : {}) }}
        onFocus={e => { e.target.style.boxShadow = `inset 0 0 0 1px ${cta}, 0 0 0 3px rgba(0,113,227,0.18)` }}
        onBlur={e => { e.target.style.boxShadow = `inset 0 0 0 0.5px ${divider}` }}
        {...props}
      >
        {children}
      </select>
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: ink2 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════ */
export default function AdminProductCreatePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [form, setForm] = useState({
    sku: '', name: '', tagline: '', description: '',
    price: '', discountRate: 0, category: '',
    color: '#1D1D1F', stock: 0, isActive: true, tags: '',
  })
  const [errors, setErrors]       = useState({})
  const [touched, setTouched]     = useState({})
  const [images, setImages]       = useState([])   // [{ url, publicId }]
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState({ visible: false, msg: '', kind: 'success' })

  const widgetRef  = useRef(null)
  const toastTimer = useRef(null)

  /* ── Toast ─ 항상 최신 setToast를 사용하도록 ref로 감싸지 않아도 setState는 stable ── */
  const showToast = (msg, kind = 'success') => {
    clearTimeout(toastTimer.current)
    setToast({ visible: true, msg, kind })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  /* ── Cloudinary Upload Widget 초기화 (스크립트 로드 대기 포함) ── */
  useEffect(() => {
    let cancelled = false   // StrictMode 이중 실행 방지
    let retries = 0
    const initWidget = () => {
      if (cancelled) return
      if (!window.cloudinary) {
        if (retries++ < 20) { setTimeout(initWidget, 100); return }
        return
      }
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName:    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo',
          uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
          folder:       'reapple/products',
          sources:      ['local', 'url', 'camera'],
          multiple:     true,
          maxFiles:     5,
          maxFileSize:  5_000_000,
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          cropping:     false,
          language:     'ko',
          styles: {
            palette: {
              window: '#FFFFFF', windowBorder: '#D2D2D7',
              tabIcon: '#0071E3', menuIcons: '#6E6E73',
              textDark: '#1D1D1F', textLight: '#FFFFFF',
              link: '#0071E3', action: '#0071E3',
              inactiveTabIcon: '#AEAEB2', error: '#FF3B30',
              inProgress: '#0071E3', complete: '#34C759', sourceBg: '#F5F5F7',
            },
          },
        },
        (error, result) => {
          if (error) {
            setToast({ visible: true, msg: '업로드 중 오류가 발생했습니다.', kind: 'error' })
            setUploading(false)
            return
          }
          if (result.event === 'upload-added') setUploading(true)
          if (result.event === 'success') {
            const { secure_url, public_id } = result.info
            setImages(prev => prev.length >= 5 ? prev : [...prev, { url: secure_url, publicId: public_id }])
            setUploading(false)
          }
          if (result.event === 'queues-end') setUploading(false)
          if (result.event === 'close') setUploading(false)
        }
      )
    }
    initWidget()
    return () => { cancelled = true; widgetRef.current?.destroy(); widgetRef.current = null }
  }, [])

  /* ── 폼 필드 핸들러 ── */
  const set = (key) => (e) => {
    let val = e.target.value
    if (key === 'price') {
      const raw = val.replace(/[^0-9]/g, '')
      val = raw ? Number(raw).toLocaleString('ko-KR') : ''
    }
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: '' }))
    setTouched(prev => ({ ...prev, [key]: true }))
  }

  const openWidget = () => {
    if (!widgetRef.current) { showToast('Cloudinary 위젯을 불러오는 중입니다.', 'error'); return }
    if (images.length >= 5) { showToast('이미지는 최대 5장까지 등록할 수 있습니다.', 'error'); return }
    widgetRef.current.open()
  }

  const removeImage = (publicId) => setImages(prev => prev.filter(img => img.publicId !== publicId))

  /* ── 유효성 검사 ── */
  const validate = () => {
    const e = {}
    const rawPrice = (form.price || '').replace(/[^0-9]/g, '')
    if (!form.sku.trim()) e.sku = 'SKU를 입력해 주세요.'
    else if (!/^[A-Z0-9\-]+$/i.test(form.sku.trim())) e.sku = '영문, 숫자, 하이픈만 사용 가능합니다.'
    if (!form.category) e.category = '카테고리를 선택해 주세요.'
    if (!form.name.trim()) e.name = '상품명을 입력해 주세요.'
    if (!rawPrice || Number(rawPrice) <= 0) e.price = '올바른 가격을 입력해 주세요.'
    return e
  }

  /* ── 등록 제출 ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      setTouched({ sku: true, category: true, name: true, price: true })
      showToast('필수 항목을 입력해 주세요.', 'error')
      return
    }
    setSaving(true)
    try {
      const rawPrice = Number((form.price || '').replace(/[^0-9]/g, ''))
      await api.post('/products', {
        sku:          form.sku.trim().toUpperCase(),
        name:         form.name.trim(),
        tagline:      form.tagline.trim(),
        description:  form.description.trim(),
        price:        rawPrice,
        discountRate: Number(form.discountRate) || 0,
        category:     form.category,
        images:       images.map(img => img.url),
        color:        form.color,
        stock:        Number(form.stock) || 0,
        isActive:     form.isActive,
        tags:         form.tags.split(',').map(s => s.trim()).filter(Boolean),
      })
      showToast('상품이 등록되었습니다.')
      setTimeout(() => navigate('/admin/products'), 1000)
    } catch (err) {
      showToast(err.response?.data?.message || '등록에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  /* ── 초기화 ── */
  const handleReset = () => {
    setForm({ sku: '', name: '', tagline: '', description: '', price: '', discountRate: 0, category: '', color: '#1D1D1F', stock: 0, isActive: true, tags: '' })
    setErrors({})
    setTouched({})
    setImages([])
  }

  /* ── 라이브 미리보기 계산값 ── */
  const pvName     = form.name.trim() || '상품명을 입력하세요'
  const pvRaw      = Number((form.price || '').replace(/[^0-9]/g, ''))
  const pvPrice    = pvRaw > 0 ? `₩${pvRaw.toLocaleString('ko-KR')}` : '₩—'
  const pvSku      = form.sku.trim().toUpperCase() || 'SKU'
  const pvCat      = form.category
  const pvPill     = pvCat ? CAT_PILL_STYLE[pvCat] : null
  const pvImageUrl = images.length > 0 ? images[0].url : ''
  const pvDiscount = Number(form.discountRate)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="adm-shell" style={{ fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside className="adm-side">
        <Link to="/" className="adm-brand"><AppleLogo /> ReApple</Link>

        <p className="adm-section-label">MENU</p>
        <nav className="adm-nav-list">

          {/* 상품 관리 (accordion open) */}
          <div>
            <div className="adm-nav-item active" style={{ cursor: 'default' }}>
              <span className="ico"><IcoPackage /></span>상품 관리
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }}><IcoChevR /></span>
            </div>
            <div style={{ marginLeft: 14, paddingLeft: 12, borderLeft: '0.5px solid rgba(255,255,255,0.10)', marginTop: 2, marginBottom: 4 }}>
              <Link to="/admin/products" style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '-0.005em', transition: 'color 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                상품 목록
              </Link>
              <span style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,0.08)', letterSpacing: '-0.005em' }}>
                상품 등록
              </span>
            </div>
          </div>

          <button className="adm-nav-item" disabled style={{ opacity: 0.4 }}>
            <span className="ico"><IcoOrders /></span>주문 관리
          </button>
          <button className="adm-nav-item" disabled style={{ opacity: 0.4 }}>
            <span className="ico"><IcoUsers /></span>회원 관리
          </button>
          <Link to="/admin/stats" className="adm-nav-item">
            <span className="ico"><IcoStats /></span>통계
          </Link>
        </nav>

        <div className="adm-nav-spacer" />
        <div className="adm-nav-foot">
          <div className="adm-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div className="adm-foot-text">
            <p className="nm">{user?.name || '관리자'}</p>
            <p className="em">{user?.email || ''}</p>
          </div>
          <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: 0, color: ink3, cursor: 'pointer', fontSize: 11 }}>로그아웃</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: ink2, marginBottom: 14 }}>
          <Link to="/admin/products" style={{ color: ink2, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = ink}
            onMouseLeave={e => e.currentTarget.style.color = ink2}>상품 관리</Link>
          <span style={{ color: ink3 }}>›</span>
          <Link to="/admin/products" style={{ color: ink2, textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = ink}
            onMouseLeave={e => e.currentTarget.style.color = ink2}>상품 목록</Link>
          <span style={{ color: ink3 }}>›</span>
          <span style={{ color: ink }}>상품 등록</span>
        </nav>

        {/* Page header */}
        <header className="adm-head" style={{ marginBottom: 24 }}>
          <div>
            <p className="eyebrow">PRODUCTS / CREATE</p>
            <h1 className="h-display h-28">새 상품 등록</h1>
          </div>
          <Link to="/admin/products"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 980, fontSize: 13, color: ink, textDecoration: 'none', letterSpacing: '-0.005em' }}>
            <IcoArrowL />목록으로
          </Link>
        </header>

        {/* 2-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

          {/* ── Form card ── */}
          <form onSubmit={handleSubmit} noValidate
            style={{ background: '#fff', borderRadius: 14, border: `0.5px solid ${divider}`, padding: '28px 28px 24px', animation: 'fadeUp 0.5s cubic-bezier(.2,.7,.2,1) both', animationDelay: '0.09s' }}>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

            <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.015em', margin: '0 0 4px', color: ink }}>상품 정보</h2>
            <p style={{ margin: '0 0 22px', color: ink2, fontSize: 13, letterSpacing: '-0.005em' }}>기본 정보를 입력하면 우측에 실시간으로 카드가 미리 그려집니다.</p>

            {/* SKU + Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field label="SKU" required error={touched.sku && errors.sku}>
                <Input
                  value={form.sku} onChange={set('sku')}
                  placeholder="APL-MBA-M3-13"
                  error={touched.sku && errors.sku}
                  style={{ textTransform: 'uppercase' }}
                />
              </Field>
              <Field label="카테고리" required error={touched.category && errors.category}>
                <Select value={form.category} onChange={set('category')} error={touched.category && errors.category}>
                  <option value="">선택하세요</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <Field label="상품명" required error={touched.name && errors.name}>
                <Input value={form.name} onChange={set('name')} placeholder="예: MacBook Air M3 13인치" error={touched.name && errors.name} />
              </Field>
            </div>

            {/* Tagline */}
            <div style={{ marginBottom: 14 }}>
              <Field label="태그라인">
                <Input value={form.tagline} onChange={set('tagline')} placeholder="예: 가볍고 빠른 나의 첫 Mac." />
              </Field>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 14 }}>
              <Field label="판매가 (원)" required error={touched.price && errors.price}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: ink2, fontSize: 14, pointerEvents: 'none' }}>₩</span>
                  <Input
                    value={form.price} onChange={set('price')}
                    placeholder="1,590,000" inputMode="numeric"
                    error={touched.price && errors.price}
                    style={{ paddingLeft: 28 }}
                  />
                </div>
              </Field>
            </div>

            {/* Discount + Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field label="할인율 (%)"
                hint={pvDiscount > 0 && pvRaw > 0
                  ? `할인가: ₩${Math.round(pvRaw * (1 - pvDiscount / 100)).toLocaleString('ko-KR')}`
                  : undefined}>
                <Input value={form.discountRate} onChange={set('discountRate')} placeholder="0" type="number" min={0} max={100} />
              </Field>
              <Field label="재고 수량">
                <Input value={form.stock} onChange={set('stock')} placeholder="0" type="number" min={0} />
              </Field>
            </div>

            {/* ── Cloudinary Image Upload ── */}
            <div style={{ marginBottom: 14 }}>
              <span style={{ display: 'block', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2, marginBottom: 8, fontWeight: 500 }}>
                이미지 <span style={{ color: ink3, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>최대 5장 · PNG/JPG/WebP · 5MB 이하</span>
              </span>

              {/* Uploaded images grid */}
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8, marginBottom: 10 }}>
                  {images.map((img, i) => (
                    <div key={img.publicId} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', border: `0.5px solid ${divider}`, background: bg2 }}>
                      <img src={img.url} alt={`업로드 이미지 ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      {/* 대표 이미지 뱃지 */}
                      {i === 0 && (
                        <span style={{ position: 'absolute', top: 4, left: 4, background: cta, color: '#fff', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, letterSpacing: '0.04em' }}>대표</span>
                      )}
                      {/* 삭제 버튼 */}
                      <button type="button" onClick={() => removeImage(img.publicId)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 0, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff' }}>
                        <IcoX />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {images.length < 5 && (
                <button type="button" onClick={openWidget} disabled={uploading}
                  style={{
                    width: '100%', height: 88,
                    border: `1px dashed ${uploading ? cta : divider}`,
                    borderRadius: 12, background: uploading ? 'rgba(0,113,227,0.04)' : bg2,
                    color: uploading ? cta : ink2, fontSize: 13,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: uploading ? 'wait' : 'pointer',
                    transition: 'all 0.15s', fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = cta; e.currentTarget.style.background = 'rgba(0,113,227,0.04)'; e.currentTarget.style.color = cta } }}
                  onMouseLeave={e => { if (!uploading) { e.currentTarget.style.borderColor = divider; e.currentTarget.style.background = bg2; e.currentTarget.style.color = ink2 } }}
                >
                  {uploading ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.22-8.56"/>
                      </svg>
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <span>업로드 중…</span>
                    </>
                  ) : (
                    <>
                      <IcoUpload />
                      <span>
                        <strong style={{ color: ink }}>Cloudinary에 업로드</strong>
                        {' — '}{images.length}/5장
                      </span>
                      <span style={{ fontSize: 11, color: ink3 }}>클릭하면 위젯이 열립니다</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <Field label="상품 설명">
                <textarea
                  value={form.description} onChange={set('description')}
                  placeholder="상품의 특징, 사양 등을 자유롭게 입력하세요."
                  rows={3}
                  style={{ ...inputBase, height: 'auto', minHeight: 88, padding: '12px 14px', resize: 'vertical', lineHeight: 1.5 }}
                  onFocus={e => { e.target.style.boxShadow = `inset 0 0 0 1px ${cta}, 0 0 0 3px rgba(0,113,227,0.18)` }}
                  onBlur={e => { e.target.style.boxShadow = `inset 0 0 0 0.5px ${divider}` }}
                />
              </Field>
            </div>

            {/* Tags + Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field label="태그" hint="쉼표로 구분">
                <Input value={form.tags} onChange={set('tags')} placeholder="신상품, 베스트, M3" />
              </Field>
              <Field label="대표 색상">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={set('color')}
                    style={{ width: 42, height: 42, padding: 2, border: `0.5px solid ${divider}`, borderRadius: 8, cursor: 'pointer', background: '#fff' }} />
                  <Input value={form.color} onChange={set('color')} placeholder="#1D1D1F" style={{ flex: 1 }} />
                </div>
              </Field>
            </div>

            {/* isActive toggle */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
                <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  style={{ width: 44, height: 26, borderRadius: 13, background: form.isActive ? cta : '#D2D2D7', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: form.isActive ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13.5, color: ink, fontWeight: 500 }}>판매 활성화</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: form.isActive ? success : ink2 }}>{form.isActive ? '등록 즉시 판매 시작' : '등록 후 판매 중지 상태'}</p>
                </div>
              </label>
            </div>

            {/* Foot buttons */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 22, borderTop: `0.5px solid ${divider}` }}>
              <button type="button" onClick={handleReset}
                style={{ background: 'transparent', color: ink, border: `0.5px solid ${divider}`, padding: '14px 22px', borderRadius: 12, fontSize: 15, cursor: 'pointer', letterSpacing: '-0.005em', fontFamily: 'inherit' }}>
                초기화
              </button>
              <button type="submit" disabled={saving}
                style={{ flex: 1, background: cta, color: '#fff', border: 0, padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'filter 0.15s', fontFamily: 'inherit' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.filter = 'brightness(1.08)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = '' }}>
                {saving ? '등록 중…' : '상품 등록하기'}
              </button>
            </div>
          </form>

          {/* ── Live preview panel ── */}
          <aside style={{
            background: bg2, borderRadius: 14, border: `0.5px solid ${divider}`,
            padding: '24px 20px', position: 'sticky', top: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', minHeight: 480, justifyContent: 'center',
            animation: 'fadeUp 0.5s cubic-bezier(.2,.7,.2,1) both', animationDelay: '0.15s',
          }}>
            <p style={{ fontSize: 12, color: ink3, letterSpacing: '-0.005em', marginBottom: 18 }}>카드 미리보기</p>

            {/* Product card */}
            <article style={{
              background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 16,
              width: '100%', maxWidth: 280, padding: 24, textAlign: 'left',
              transition: 'transform 0.25s cubic-bezier(.2,.7,.2,1)',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>

              {/* Category pill */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px',
                borderRadius: 980, fontSize: 11, marginBottom: 14, letterSpacing: '-0.005em',
                background: pvPill ? pvPill.bg : bg2,
                color: pvPill ? pvPill.color : ink2,
              }}>
                {pvCat || '카테고리'}
              </span>

              {/* Product illustration */}
              <div style={{ width: '100%', aspectRatio: '1.4', background: bg2, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
                {pvImageUrl ? (
                  <>
                    <img src={pvImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {images.length > 1 && (
                      <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 6, letterSpacing: '-0.005em' }}>
                        +{images.length - 1}장
                      </span>
                    )}
                  </>
                ) : (
                  <div style={{ width: 72, height: 72 }}>
                    {pvCat ? CATEGORY_ICONS[pvCat] : <PlaceholderIcon />}
                  </div>
                )}
              </div>

              {/* Name */}
              <h4 style={{
                fontFamily: '"SF Pro Display",-apple-system,sans-serif',
                fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25,
                margin: '0 0 6px', wordBreak: 'keep-all',
                color: form.name.trim() ? ink : ink3,
              }}>
                {pvName}
              </h4>

              {/* Price */}
              <p style={{ fontSize: 14, margin: '0 0 4px', letterSpacing: '-0.005em', color: pvRaw > 0 ? ink : ink3 }}>
                {pvPrice}
                {pvDiscount > 0 && pvRaw > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#FF9500' }}>{pvDiscount}%↓</span>
                )}
              </p>
              {pvDiscount > 0 && pvRaw > 0 && (
                <p style={{ fontSize: 12, margin: '0 0 10px', color: ink2, letterSpacing: '-0.005em' }}>
                  할인가 ₩{Math.round(pvRaw * (1 - pvDiscount / 100)).toLocaleString('ko-KR')}
                </p>
              )}

              {/* SKU */}
              <p style={{ fontFamily: '"SF Mono",ui-monospace,Menlo,monospace', fontSize: 11, color: ink3, letterSpacing: '0.04em', margin: pvDiscount > 0 && pvRaw > 0 ? 0 : '8px 0 0' }}>
                {pvSku}
              </p>
            </article>

            {/* Live indicator */}
            <p style={{ fontSize: 11, color: ink3, marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: success, display: 'inline-block',
                boxShadow: '0 0 0 3px rgba(52,199,89,0.18)',
                animation: 'pulse 2s infinite',
              }} />
              입력 시 실시간 반영
            </p>
            <style>{`
              @keyframes pulse {
                0%,100% { box-shadow: 0 0 0 3px rgba(52,199,89,0.18); }
                50% { box-shadow: 0 0 0 6px rgba(52,199,89,0.05); }
              }
            `}</style>
          </aside>
        </div>
      </main>

      <Toast msg={toast.msg} kind={toast.kind} visible={toast.visible} />
    </div>
  )
}
