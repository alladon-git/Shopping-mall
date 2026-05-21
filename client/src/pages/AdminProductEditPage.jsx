import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
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

/* ── Icons ── */
const Svg = ({ size = 16, stroke = 1.7, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const IcoPackage = () => <Svg><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></Svg>
const IcoOrders  = () => <Svg><path d="M3 7h14l-1 12H4L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></Svg>
const IcoUsers   = () => <Svg><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.6"/><path d="M14.5 20a4.6 4.6 0 0 1 6.5-4"/></Svg>
const IcoStats   = () => <Svg><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Svg>
const IcoArrowL  = () => <Svg size={12} stroke={2.2}><path d="M19 12H5M11 6l-6 6 6 6"/></Svg>
const IcoChevR   = () => <Svg size={12} stroke={2}><path d="m9 6 6 6-6 6"/></Svg>
const IcoChevD   = () => <Svg size={12} stroke={2}><path d="m6 9 6 6 6-6"/></Svg>
const IcoUpload  = () => <Svg size={22} stroke={1.5}><path d="M21 14v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3"/><path d="M7 9 12 4l5 5"/><path d="M12 4v12"/></Svg>
const IcoX       = () => <Svg size={12} stroke={2}><path d="M6 6l12 12M18 6 6 18"/></Svg>
const IcoCheck   = () => <Svg size={14} stroke={2.5}><path d="m5 12 5 5 9-11"/></Svg>
const IcoSpin    = () => <Svg size={20} stroke={1.8}><path d="M21 12a9 9 0 1 1-6.22-8.56"/></Svg>
const IcoStar    = () => <Svg size={11} stroke={0} fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Svg>

const AppleLogo = () => (
  <svg width={14} height={17} viewBox="0 0 20 24" fill="currentColor">
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Category pill colors ── */
const CAT_PILL = {
  Mac:           { bg: '#E8F0FE', color: '#1A73E8' },
  iPhone:        { bg: '#FCE8E6', color: '#C5221F' },
  iPad:          { bg: '#E6F4EA', color: '#137333' },
  'Apple Watch': { bg: '#FEF7E0', color: '#B06000' },
  AirPods:       { bg: '#F3E8FD', color: '#6A0DAD' },
  Accessories:   { bg: '#F3F4F6', color: '#374151' },
}

/* ── Category SVG thumbnails ── */
const CAT_ICONS = {
  Mac: <svg viewBox="0 0 72 72"><rect x="8" y="16" width="56" height="36" rx="4" fill="#1D1D1F"/><rect x="11" y="19" width="50" height="30" rx="2" fill="#0a0a0c"/><circle cx="36" cy="34" r="9" fill="#0071E3"/><circle cx="36" cy="34" r="4" fill="#34C759"/><path d="M2 52 H70 L66 60 H6 Z" fill="#3a3a3c"/></svg>,
  iPhone: <svg viewBox="0 0 72 72"><rect x="24" y="6" width="24" height="58" rx="5" fill="#5e5847"/><rect x="26" y="8" width="20" height="54" rx="4" fill="#0a0a0c"/><rect x="28" y="17" width="16" height="22" rx="3" fill="#1c1c1e"/><circle cx="36" cy="28" r="5" fill="#3a3a3c"/></svg>,
  iPad: <svg viewBox="0 0 72 72"><rect x="14" y="8" width="44" height="56" rx="5" fill="#1D1D1F"/><rect x="16" y="10" width="40" height="52" rx="3" fill="#FFFFFF"/><rect x="20" y="14" width="14" height="14" rx="2" fill="#0071E3" opacity="0.2"/></svg>,
  'Apple Watch': <svg viewBox="0 0 72 72"><rect x="26" y="4" width="20" height="10" rx="4" fill="#C8C8CC"/><rect x="26" y="58" width="20" height="10" rx="4" fill="#C8C8CC"/><rect x="20" y="14" width="32" height="44" rx="9" fill="#1D1D1F"/><rect x="22" y="16" width="28" height="40" rx="7" fill="#0a0a0c"/></svg>,
  AirPods: <svg viewBox="0 0 72 72"><rect x="14" y="26" width="44" height="22" rx="11" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/><circle cx="26" cy="36" r="5" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/><circle cx="46" cy="36" r="5" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.6"/></svg>,
  Accessories: <svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="22" fill="#FFFFFF" stroke="#D2D2D7" strokeWidth="0.8"/><circle cx="36" cy="36" r="14" fill="#F5F5F7"/><circle cx="36" cy="36" r="4" fill="#1D1D1F"/></svg>,
}

/* ── Toast ── */
function Toast({ msg, kind, visible }) {
  const bg = kind === 'error' ? danger : kind === 'success' ? success : ink
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
      background: bg, color: '#fff', borderRadius: 980,
      padding: '11px 18px 11px 14px', fontSize: 13,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
      opacity: visible ? 1 : 0, pointerEvents: 'none',
      transition: 'opacity 0.25s, transform 0.3s cubic-bezier(.2,.7,.2,1)',
      zIndex: 90, letterSpacing: '-0.005em', whiteSpace: 'nowrap',
    }}>
      {kind === 'success' && <span style={{ color: '#fff', display: 'inline-flex' }}><IcoCheck /></span>}
      {msg}
    </div>
  )
}

/* ── Shared input styles ── */
const inputBase = {
  width: '100%', height: 42, padding: '10px 14px',
  borderRadius: 8, border: 0,
  boxShadow: `inset 0 0 0 0.5px ${divider}`,
  background: '#fff', color: ink,
  fontSize: 14, outline: 'none',
  letterSpacing: '-0.005em', fontFamily: 'inherit',
  transition: 'box-shadow 0.15s ease', boxSizing: 'border-box',
}

function FieldLabel({ children, required }) {
  return (
    <span style={{ display: 'block', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: ink2, marginBottom: 6, fontWeight: 500 }}>
      {children}{required && <span style={{ color: danger, marginLeft: 2 }}>*</span>}
    </span>
  )
}

function StyledInput({ error, style, ...props }) {
  return (
    <input
      style={{ ...inputBase, ...(error ? { boxShadow: `inset 0 0 0 1px ${danger}, 0 0 0 3px rgba(255,59,48,0.12)` } : {}), ...style }}
      onFocus={e => { if (!error) e.target.style.boxShadow = `inset 0 0 0 1px ${cta}, 0 0 0 3px rgba(0,113,227,0.18)` }}
      onBlur={e => { e.target.style.boxShadow = error ? `inset 0 0 0 1px ${danger}, 0 0 0 3px rgba(255,59,48,0.12)` : `inset 0 0 0 0.5px ${divider}` }}
      {...props}
    />
  )
}

function StyledSelect({ children, error, ...props }) {
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
        <IcoChevD />
      </span>
    </div>
  )
}

/* ── 사이드바 (컴포넌트 외부에 정의 → 매 렌더마다 리마운트 방지) ── */
function EditSidebar({ user, onLogout }) {
  return (
    <aside className="adm-side">
      <Link to="/" className="adm-brand"><AppleLogo /> ReApple</Link>
      <p className="adm-section-label">MENU</p>
      <nav className="adm-nav-list">
        <div>
          <div className="adm-nav-item active" style={{ cursor: 'default' }}>
            <span className="ico"><IcoPackage /></span>상품 관리
            <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }}><IcoChevR /></span>
          </div>
          <div style={{ marginLeft: 14, paddingLeft: 12, borderLeft: '0.5px solid rgba(255,255,255,0.10)', marginTop: 2, marginBottom: 4 }}>
            <Link to="/admin/products"
              style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '-0.005em' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              상품 목록
            </Link>
            <span style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,0.08)', letterSpacing: '-0.005em' }}>
              상품 수정
            </span>
          </div>
        </div>
        <button className="adm-nav-item" disabled style={{ opacity: 0.4 }}><span className="ico"><IcoOrders /></span>주문 관리</button>
        <button className="adm-nav-item" disabled style={{ opacity: 0.4 }}><span className="ico"><IcoUsers /></span>회원 관리</button>
        <Link to="/admin/stats" className="adm-nav-item"><span className="ico"><IcoStats /></span>통계</Link>
      </nav>
      <div className="adm-nav-spacer" />
      <div className="adm-nav-foot">
        <div className="adm-avatar">{user?.name?.charAt(0) || 'A'}</div>
        <div className="adm-foot-text">
          <p className="nm">{user?.name || '관리자'}</p>
          <p className="em">{user?.email || ''}</p>
        </div>
        <button onClick={onLogout} style={{ marginLeft: 'auto', background: 'none', border: 0, color: ink3, cursor: 'pointer', fontSize: 11 }}>로그아웃</button>
      </div>
    </aside>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════ */
export default function AdminProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [form, setForm]     = useState(null)   // null = 로딩 중
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  /* images: [{ url, publicId }]
     기존 이미지는 publicId = url (Cloudinary public_id 없는 경우 대비) */
  const [images, setImages]       = useState([])
  const [uploading, setUploading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving]       = useState(false)
  const [toast, setToast]         = useState({ visible: false, msg: '', kind: 'success' })

  const widgetRef  = useRef(null)
  const imagesRef  = useRef(images)   // 최신 images 참조 (위젯 콜백 내부에서 사용)

  /* imagesRef를 항상 최신 상태로 유지 */
  useEffect(() => { imagesRef.current = images }, [images])

  const showToast = (msg, kind = 'success') => {
    setToast({ visible: true, msg, kind })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2600)
  }

  /* ── 기존 상품 데이터 로드 ── */
  useEffect(() => {
    api.get(`/products/${id}`)
      .then(({ data }) => {
        setForm({
          sku:          data.sku || '',
          name:         data.name || '',
          tagline:      data.tagline || '',
          description:  data.description || '',
          price:        data.price != null ? Number(data.price).toLocaleString('ko-KR') : '',
          discountRate: data.discountRate ?? 0,
          category:     data.category || '',
          color:        data.color || '#1D1D1F',
          stock:        data.stock ?? 0,
          isActive:     data.isActive ?? true,
          tags:         (data.tags || []).join(', '),
        })
        setImages((data.images || []).map(url => ({ url, publicId: url })))
      })
      .catch(() => setLoadError('상품 정보를 불러오지 못했습니다.'))
  }, [id])

  /* ── Cloudinary Upload Widget 초기화 ── */
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
          cropping: false,
          language: 'ko',
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
          if (cancelled) return
          if (error) { setUploading(false); return }
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

  /* 현재 업로드 가능한 잔여 슬롯을 계산해 위젯 오픈 */
  const openWidget = () => {
    if (!widgetRef.current) {
      showToast('Cloudinary 위젯을 불러오는 중입니다.', 'error')
      return
    }
    const remaining = 5 - imagesRef.current.length
    if (remaining <= 0) {
      showToast('이미지는 최대 5장까지 등록할 수 있습니다.', 'error')
      return
    }
    widgetRef.current.open()
  }

  const removeImage = (publicId) => setImages(prev => prev.filter(img => img.publicId !== publicId))

  /* 대표 이미지를 맨 앞으로 이동 */
  const setMainImage = (publicId) => {
    setImages(prev => {
      const target = prev.find(img => img.publicId === publicId)
      return target ? [target, ...prev.filter(img => img.publicId !== publicId)] : prev
    })
  }

  const set = (key) => (e) => {
    let val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    if (key === 'price') {
      const raw = val.replace(/[^0-9]/g, '')
      val = raw ? Number(raw).toLocaleString('ko-KR') : ''
    }
    setForm(f => ({ ...f, [key]: val }))
    setErrors(er => ({ ...er, [key]: '' }))
    setTouched(t => ({ ...t, [key]: true }))
  }

  const validate = () => {
    const e = {}
    const rawPrice = (form.price || '').replace(/[^0-9]/g, '')
    if (!form.name.trim()) e.name = '상품명을 입력해 주세요.'
    if (!form.category) e.category = '카테고리를 선택해 주세요.'
    if (!rawPrice || Number(rawPrice) <= 0) e.price = '올바른 가격을 입력해 주세요.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      setTouched({ name: true, category: true, price: true })
      showToast('필수 항목을 입력해 주세요.', 'error')
      return
    }
    setSaving(true)
    try {
      const rawPrice = Number((form.price || '').replace(/[^0-9]/g, ''))
      await api.put(`/products/${id}`, {
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
      showToast('상품이 수정되었습니다.')
      setTimeout(() => navigate('/admin/products'), 900)
    } catch (err) {
      showToast(err.response?.data?.message || '수정에 실패했습니다.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  /* ── 라이브 미리보기 값 ── */
  const pvName     = form?.name?.trim() || '상품명을 입력하세요'
  const pvRaw      = Number((form?.price || '').replace(/[^0-9]/g, ''))
  const pvPrice    = pvRaw > 0 ? `₩${pvRaw.toLocaleString()}` : '₩0'
  const pvCat      = form?.category || ''
  const pvPill     = pvCat ? CAT_PILL[pvCat] : null
  const pvSku      = form?.sku || '—'
  const pvImageUrl = images.length > 0 ? images[0].url : ''

  if (loadError) {
    return (
      <div className="adm-shell">
        <EditSidebar user={user} onLogout={handleLogout} />
        <main className="adm-main" style={{ display: 'grid', placeItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: danger, fontSize: 15, marginBottom: 16 }}>{loadError}</p>
            <Link to="/admin/products" style={{ color: cta, fontSize: 13 }}>← 목록으로</Link>
          </div>
        </main>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="adm-shell">
        <EditSidebar user={user} onLogout={handleLogout} />
        <main className="adm-main" style={{ display: 'grid', placeItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: ink2 }}>
            <div style={{ animation: 'spin 1s linear infinite', display: 'inline-flex' }}><IcoSpin /></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 13 }}>상품 정보를 불러오는 중…</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="adm-shell" style={{ fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif' }}>
      <EditSidebar user={user} onLogout={handleLogout} />

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
          <span style={{ color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{form.name || '상품 수정'}</span>
        </nav>

        {/* Page header */}
        <header className="adm-head" style={{ marginBottom: 24 }}>
          <div>
            <p className="eyebrow">PRODUCTS / EDIT</p>
            <h1 className="h-display h-28">상품 수정</h1>
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
            style={{ background: '#fff', borderRadius: 14, border: `0.5px solid ${divider}`, padding: '28px 28px 24px', animation: 'fadeUp 0.4s cubic-bezier(.2,.7,.2,1) both' }}>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>

            <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 20, fontWeight: 500, letterSpacing: '-0.015em', margin: '0 0 4px', color: ink }}>상품 정보 수정</h2>
            <p style={{ margin: '0 0 22px', color: ink2, fontSize: 13, letterSpacing: '-0.005em' }}>수정할 내용을 입력하면 우측 카드에 실시간으로 반영됩니다.</p>

            {/* SKU (readonly) + Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <FieldLabel>SKU <span style={{ color: ink3, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>변경 불가</span></FieldLabel>
                <input value={form.sku} readOnly
                  style={{ ...inputBase, background: bg2, color: ink2, cursor: 'not-allowed', userSelect: 'none' }} />
              </div>
              <div>
                <FieldLabel required>카테고리</FieldLabel>
                <StyledSelect value={form.category} onChange={set('category')} error={touched.category && errors.category}>
                  <option value="">선택하세요</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </StyledSelect>
                {touched.category && errors.category && <p style={{ fontSize: 12, color: danger, margin: '5px 0 0' }}>{errors.category}</p>}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel required>상품명</FieldLabel>
              <StyledInput value={form.name} onChange={set('name')} placeholder="예: MacBook Air M3 13인치" error={touched.name && errors.name} />
              {touched.name && errors.name && <p style={{ fontSize: 12, color: danger, margin: '5px 0 0' }}>{errors.name}</p>}
            </div>

            {/* Tagline */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>태그라인</FieldLabel>
              <StyledInput value={form.tagline} onChange={set('tagline')} placeholder="예: 가볍고 빠른 나의 첫 Mac." />
            </div>

            {/* Price */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel required>판매가 (원)</FieldLabel>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: ink2, fontSize: 14, pointerEvents: 'none' }}>₩</span>
                <StyledInput value={form.price} onChange={set('price')} placeholder="1,590,000" inputMode="numeric" error={touched.price && errors.price} style={{ paddingLeft: 28 }} />
              </div>
              {touched.price && errors.price && <p style={{ fontSize: 12, color: danger, margin: '5px 0 0' }}>{errors.price}</p>}
            </div>

            {/* Discount + Stock */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <FieldLabel>할인율 (%)</FieldLabel>
                <StyledInput value={form.discountRate} onChange={set('discountRate')} type="number" min={0} max={100} placeholder="0" />
                {form.discountRate > 0 && pvRaw > 0 && (
                  <p style={{ fontSize: 11, color: success, margin: '4px 0 0' }}>
                    할인가: ₩{Math.round(pvRaw * (1 - Number(form.discountRate) / 100)).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <FieldLabel>재고 수량</FieldLabel>
                <StyledInput value={form.stock} onChange={set('stock')} type="number" min={0} placeholder="0" />
              </div>
            </div>

            {/* ── Images ── */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                <FieldLabel>이미지 <span style={{ color: ink3, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>첫 번째가 대표 이미지</span></FieldLabel>
                <span style={{ fontSize: 11, color: images.length >= 5 ? danger : ink3 }}>{images.length}/5장</span>
              </div>

              {/* 업로드된 이미지 그리드 */}
              {images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8, marginBottom: 8 }}>
                  {images.map((img, i) => (
                    <div key={img.publicId}
                      style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1', border: i === 0 ? `2px solid ${cta}` : `0.5px solid ${divider}`, background: bg2, cursor: i === 0 ? 'default' : 'pointer', flexShrink: 0 }}
                      onClick={() => i !== 0 && setMainImage(img.publicId)}
                      title={i === 0 ? '대표 이미지' : '클릭하면 대표 이미지로 설정'}>
                      <img src={img.url} alt={`이미지 ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                      {/* 대표 배지 */}
                      {i === 0 ? (
                        <span style={{ position: 'absolute', top: 5, left: 5, background: cta, color: '#fff', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 2, letterSpacing: '0.02em' }}>
                          <IcoStar />대표
                        </span>
                      ) : (
                        /* 대표 설정 힌트 오버레이 */
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6, opacity: 0, transition: 'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.35)'; e.currentTarget.style.opacity = 1 }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0)'; e.currentTarget.style.opacity = 0 }}>
                          <span style={{ fontSize: 9, color: '#fff', fontWeight: 600, letterSpacing: '0.02em', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>대표로 설정</span>
                        </div>
                      )}

                      {/* 삭제 버튼 */}
                      <button type="button" onClick={e => { e.stopPropagation(); removeImage(img.publicId) }}
                        style={{ position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 0, display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = danger }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.55)' }}>
                        <IcoX />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Cloudinary 업로드 버튼 */}
              {images.length < 5 && (
                <button type="button" onClick={openWidget} disabled={uploading}
                  style={{ width: '100%', height: images.length === 0 ? 96 : 72, border: `1.5px dashed ${uploading ? cta : divider}`, borderRadius: 12, background: uploading ? 'rgba(0,113,227,0.04)' : bg2, color: uploading ? cta : ink2, fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', letterSpacing: '-0.005em' }}
                  onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = cta; e.currentTarget.style.color = cta; e.currentTarget.style.background = 'rgba(0,113,227,0.04)' } }}
                  onMouseLeave={e => { if (!uploading) { e.currentTarget.style.borderColor = divider; e.currentTarget.style.color = ink2; e.currentTarget.style.background = bg2 } }}>
                  {uploading ? (
                    <>
                      <div style={{ animation: 'spin 1s linear infinite', display: 'inline-flex', color: cta }}><IcoUpload /></div>
                      <span style={{ fontSize: 12 }}>업로드 중…</span>
                    </>
                  ) : (
                    <>
                      <IcoUpload />
                      <span><strong style={{ color: ink }}>Cloudinary로 이미지 추가</strong></span>
                      <span style={{ fontSize: 11, color: ink3 }}>JPG · PNG · WebP · 최대 5MB</span>
                    </>
                  )}
                </button>
              )}

              {/* 5장 꽉 찬 경우 안내 */}
              {images.length >= 5 && (
                <p style={{ fontSize: 11, color: ink2, margin: '6px 0 0', textAlign: 'center' }}>
                  이미지가 최대({images.length}장)에 달했습니다. 삭제 후 추가할 수 있습니다.
                </p>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>상품 설명</FieldLabel>
              <textarea value={form.description} onChange={set('description')} placeholder="상품의 특징, 사양 등을 자유롭게 입력하세요." rows={3}
                style={{ ...inputBase, height: 'auto', minHeight: 88, padding: '12px 14px', resize: 'vertical', lineHeight: 1.5 }}
                onFocus={e => { e.target.style.boxShadow = `inset 0 0 0 1px ${cta}, 0 0 0 3px rgba(0,113,227,0.18)` }}
                onBlur={e => { e.target.style.boxShadow = `inset 0 0 0 0.5px ${divider}` }}
              />
            </div>

            {/* Tags + Color */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <FieldLabel>태그 <span style={{ color: ink3, fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>쉼표로 구분</span></FieldLabel>
                <StyledInput value={form.tags} onChange={set('tags')} placeholder="신상품, 베스트, M3" />
              </div>
              <div>
                <FieldLabel>대표 색상</FieldLabel>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={form.color} onChange={set('color')}
                    style={{ width: 42, height: 42, padding: 2, border: `0.5px solid ${divider}`, borderRadius: 8, cursor: 'pointer', background: '#fff' }} />
                  <StyledInput value={form.color} onChange={set('color')} placeholder="#1D1D1F" style={{ flex: 1 }} />
                </div>
              </div>
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
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: form.isActive ? success : ink2 }}>
                    {form.isActive ? '현재 판매 중' : '판매 중지 상태'}
                  </p>
                </div>
              </label>
            </div>

            {/* Foot buttons */}
            <div style={{ display: 'flex', gap: 10, paddingTop: 22, borderTop: `0.5px solid ${divider}` }}>
              <Link to="/admin/products"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: ink, border: `0.5px solid ${divider}`, padding: '14px 22px', borderRadius: 12, fontSize: 15, cursor: 'pointer', letterSpacing: '-0.005em', textDecoration: 'none' }}>
                취소
              </Link>
              <button type="submit" disabled={saving}
                style={{ flex: 1, background: cta, color: '#fff', border: 0, padding: '14px 20px', borderRadius: 12, fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'filter 0.15s', fontFamily: 'inherit' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.filter = 'brightness(1.08)' }}
                onMouseLeave={e => { e.currentTarget.style.filter = '' }}>
                {saving ? '저장 중…' : '수정 완료'}
              </button>
            </div>
          </form>

          {/* ── Live preview panel ── */}
          <aside style={{ background: bg2, borderRadius: 14, border: `0.5px solid ${divider}`, padding: '24px 20px', position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: 480, justifyContent: 'center' }}>
            <p style={{ fontSize: 12, color: ink3, letterSpacing: '-0.005em', marginBottom: 18 }}>카드 미리보기</p>

            <article style={{ background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 16, width: '100%', maxWidth: 280, padding: 24, textAlign: 'left', transition: 'transform 0.25s cubic-bezier(.2,.7,.2,1)' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>

              {/* 카테고리 필 */}
              <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 10px', borderRadius: 980, fontSize: 11, marginBottom: 14, letterSpacing: '-0.005em', background: pvPill ? pvPill.bg : bg2, color: pvPill ? pvPill.color : ink2 }}>
                {pvCat || '카테고리'}
              </span>

              {/* 이미지 영역 — DB에서 불러온 이미지 또는 새로 업로드한 이미지 표시 */}
              <div style={{ width: '100%', aspectRatio: '1.4', background: bg2, borderRadius: 12, display: 'grid', placeItems: 'center', marginBottom: 16, overflow: 'hidden', position: 'relative' }}>
                {pvImageUrl ? (
                  <>
                    <img src={pvImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {images.length > 1 && (
                      <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 6, letterSpacing: '-0.005em' }}>
                        +{images.length - 1}장
                      </span>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 64, height: 64, opacity: 0.5 }}>
                      {pvCat ? CAT_ICONS[pvCat] : <svg viewBox="0 0 72 72"><rect x="8" y="20" width="56" height="32" rx="4" fill="#D2D2D7"/><rect x="12" y="24" width="48" height="24" rx="2" fill="#E8E8ED"/><path d="M2 52 H70 L66 60 H6 Z" fill="#D2D2D7"/></svg>}
                    </div>
                    <span style={{ fontSize: 10, color: ink3, letterSpacing: '-0.005em' }}>이미지 없음</span>
                  </div>
                )}
              </div>

              {/* 상품명 */}
              <h4 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25, margin: '0 0 6px', wordBreak: 'keep-all', color: form.name?.trim() ? ink : ink3 }}>
                {pvName}
              </h4>

              {/* 가격 */}
              <p style={{ fontSize: 14, margin: '0 0 4px', letterSpacing: '-0.005em', color: pvRaw > 0 ? ink : ink3 }}>
                {pvPrice}
                {Number(form.discountRate) > 0 && pvRaw > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 12, color: '#FF9500' }}>{form.discountRate}%↓</span>
                )}
              </p>
              {Number(form.discountRate) > 0 && pvRaw > 0 && (
                <p style={{ fontSize: 12, margin: '0 0 10px', color: ink2 }}>
                  할인가 ₩{Math.round(pvRaw * (1 - Number(form.discountRate) / 100)).toLocaleString('ko-KR')}
                </p>
              )}

              {/* SKU */}
              <p style={{ fontFamily: '"SF Mono",ui-monospace,Menlo,monospace', fontSize: 11, color: ink3, letterSpacing: '0.04em', margin: Number(form.discountRate) > 0 && pvRaw > 0 ? 0 : '8px 0 0' }}>
                {pvSku}
              </p>
            </article>

            {/* 이미지 개수 표시 */}
            {images.length > 0 && (
              <p style={{ fontSize: 11, color: cta, marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: cta, display: 'inline-block' }} />
                이미지 {images.length}장 등록됨
              </p>
            )}

            <p style={{ fontSize: 11, color: ink3, marginTop: images.length > 0 ? 6 : 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: success, display: 'inline-block', boxShadow: '0 0 0 3px rgba(52,199,89,0.18)', animation: 'pulse 2s infinite' }} />
              입력 시 실시간 반영
            </p>
            <style>{`
              @keyframes spin  { to { transform: rotate(360deg); } }
              @keyframes pulse { 0%,100% { box-shadow: 0 0 0 3px rgba(52,199,89,0.18); } 50% { box-shadow: 0 0 0 6px rgba(52,199,89,0.05); } }
            `}</style>
          </aside>
        </div>
      </main>

      <Toast msg={toast.msg} kind={toast.kind} visible={toast.visible} />
    </div>
  )
}
