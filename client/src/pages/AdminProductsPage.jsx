import { useState, useEffect, useCallback } from 'react'
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

const EMPTY_FORM = {
  sku: '', name: '', tagline: '', description: '',
  price: '', discountRate: 0, category: 'Mac',
  images: '', color: '#1D1D1F', stock: 0,
  isActive: true, tags: '',
}

/* ── SVG icons ── */
const Svg = ({ size = 16, stroke = 1.7, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)
const IconPlus     = () => <Svg><path d="M12 5v14M5 12h14"/></Svg>
const IconEdit     = () => <Svg size={14}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></Svg>
const IconTrash    = () => <Svg size={14}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></Svg>
const IconSearch   = () => <Svg size={14}><circle cx="10.5" cy="10.5" r="7"/><path d="m21 21-5-5"/></Svg>
const IconX        = () => <Svg size={14} stroke={2}><path d="M18 6 6 18M6 6l12 12"/></Svg>
const IconChevronL = () => <Svg size={14} stroke={2}><path d="m15 18-6-6 6-6"/></Svg>
const IconChevronR = () => <Svg size={14} stroke={2}><path d="m9 18 6-6-6-6"/></Svg>
const IconPackage  = () => <Svg><path d="m4 7 8-4 8 4-8 4-8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></Svg>
const IconOrders   = () => <Svg><path d="M3 7h14l-1 12H4L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></Svg>
const IconUsers    = () => <Svg><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.6"/><path d="M14.5 20a4.6 4.6 0 0 1 6.5-4"/></Svg>
const IconStats    = () => <Svg><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></Svg>
const IconAlert    = () => <Svg size={20} stroke={1.7}><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></Svg>

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

/* ── Confirm Dialog ── */
function ConfirmDialog({ product, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 24px 60px -10px rgba(0,0,0,0.28)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: danger }}>
          <IconAlert />
        </div>
        <h3 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 17, fontWeight: 600, margin: '0 0 8px', textAlign: 'center', color: ink }}>상품 삭제</h3>
        <p style={{ fontSize: 13.5, color: ink2, textAlign: 'center', margin: '0 0 24px', lineHeight: 1.6, letterSpacing: '-0.005em' }}>
          <strong style={{ color: ink }}>{product.name}</strong>을(를) 삭제합니다.<br/>이 작업은 되돌릴 수 없습니다.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, height: 42, background: bg2, border: `0.5px solid ${divider}`, borderRadius: 10, fontSize: 14, color: ink, cursor: 'pointer', fontFamily: 'inherit' }}>
            취소
          </button>
          <button onClick={onConfirm} style={{ flex: 1, height: 42, background: danger, border: 0, borderRadius: 10, fontSize: 14, color: '#fff', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Product Form Modal ── */
function ProductModal({ product, onSave, onClose, saving }) {
  const isEdit = !!product?._id
  const [form, setForm] = useState(() => {
    if (!isEdit) return EMPTY_FORM
    return {
      ...EMPTY_FORM,
      ...product,
      images: (product.images || []).join(', '),
      tags:   (product.tags   || []).join(', '),
      price:  product.price ?? '',
    }
  })
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: val }))
    setErrors(er => ({ ...er, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.sku.trim()) e.sku = 'SKU를 입력하세요.'
    else if (!/^[A-Z0-9\-]+$/i.test(form.sku)) e.sku = '영문, 숫자, 하이픈만 사용할 수 있습니다.'
    if (!form.name.trim()) e.name = '상품명을 입력하세요.'
    if (!form.price || Number(form.price) < 0) e.price = '가격을 입력하세요.'
    if (!form.category) e.category = '카테고리를 선택하세요.'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({
      ...form,
      sku: form.sku.toUpperCase().trim(),
      price: Number(form.price),
      discountRate: Number(form.discountRate) || 0,
      stock: Number(form.stock) || 0,
      images: form.images.split(',').map(s => s.trim()).filter(Boolean),
      tags:   form.tags.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  const inputStyle = (err) => ({
    width: '100%', height: 40,
    padding: '0 12px',
    border: `0.5px solid ${err ? danger : divider}`,
    borderRadius: 8, outline: 'none',
    fontSize: 13.5, color: ink,
    background: '#fff', fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  })
  const labelStyle = { fontSize: 12, fontWeight: 500, color: ink, display: 'block', marginBottom: 5 }
  const errStyle   = { fontSize: 11, color: danger, marginTop: 4 }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 110, padding: '40px 24px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 580, boxShadow: '0 24px 60px -10px rgba(0,0,0,0.3)', position: 'relative', marginBottom: 40 }}>

        {/* Header */}
        <div style={{ padding: '22px 24px 18px', borderBottom: `0.5px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: ink2, margin: '0 0 4px' }}>
              {isEdit ? '상품 수정' : '상품 등록'}
            </p>
            <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.02em', color: ink }}>
              {isEdit ? form.name || '상품 수정' : '새 상품 추가'}
            </h2>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: bg2, border: 0, display: 'grid', placeItems: 'center', cursor: 'pointer', color: ink2 }}>
            <IconX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>

            {/* SKU */}
            <div>
              <label style={labelStyle}>SKU <span style={{ color: danger }}>*</span></label>
              <input value={form.sku} onChange={set('sku')} placeholder="APL-MBP-14-M3"
                style={{ ...inputStyle(errors.sku), textTransform: 'uppercase' }}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = errors.sku ? danger : divider; e.target.style.boxShadow = 'none' }}
                disabled={isEdit}
              />
              {errors.sku && <p style={errStyle}>{errors.sku}</p>}
              {isEdit && <p style={{ fontSize: 11, color: ink3, marginTop: 4 }}>등록 후 SKU는 변경할 수 없습니다.</p>}
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>카테고리 <span style={{ color: danger }}>*</span></label>
              <select value={form.category} onChange={set('category')} style={{ ...inputStyle(errors.category), appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236E6E73' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p style={errStyle}>{errors.category}</p>}
            </div>

            {/* Name */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>상품명 <span style={{ color: danger }}>*</span></label>
              <input value={form.name} onChange={set('name')} placeholder="MacBook Pro 14인치 M3"
                style={inputStyle(errors.name)}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = errors.name ? danger : divider; e.target.style.boxShadow = 'none' }}
              />
              {errors.name && <p style={errStyle}>{errors.name}</p>}
            </div>

            {/* Tagline */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>태그라인</label>
              <input value={form.tagline} onChange={set('tagline')} placeholder="Pro의 모든 것. 더 빠르게."
                style={inputStyle(false)}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = divider; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>상품 설명</label>
              <textarea value={form.description} onChange={set('description')} placeholder="상품에 대한 상세 설명을 입력하세요."
                rows={3}
                style={{ ...inputStyle(false), height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.55 }}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = divider; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Price */}
            <div>
              <label style={labelStyle}>정가 (₩) <span style={{ color: danger }}>*</span></label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="2490000" min={0}
                style={inputStyle(errors.price)}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = errors.price ? danger : divider; e.target.style.boxShadow = 'none' }}
              />
              {errors.price && <p style={errStyle}>{errors.price}</p>}
            </div>

            {/* Discount Rate */}
            <div>
              <label style={labelStyle}>할인율 (%)</label>
              <input type="number" value={form.discountRate} onChange={set('discountRate')} placeholder="0" min={0} max={100}
                style={inputStyle(false)}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = divider; e.target.style.boxShadow = 'none' }}
              />
              {form.discountRate > 0 && form.price > 0 && (
                <p style={{ fontSize: 11, color: success, marginTop: 4 }}>
                  할인가: ₩{Math.round(Number(form.price) * (1 - Number(form.discountRate) / 100)).toLocaleString()}
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label style={labelStyle}>재고 수량</label>
              <input type="number" value={form.stock} onChange={set('stock')} placeholder="0" min={0}
                style={inputStyle(false)}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = divider; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Color */}
            <div>
              <label style={labelStyle}>대표 색상</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.color} onChange={set('color')}
                  style={{ width: 40, height: 40, padding: 2, border: `0.5px solid ${divider}`, borderRadius: 8, cursor: 'pointer', background: '#fff' }}
                />
                <input value={form.color} onChange={set('color')} placeholder="#1D1D1F"
                  style={{ ...inputStyle(false), flex: 1 }}
                  onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                  onBlur={e => { e.target.style.borderColor = divider; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Images */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>이미지 URL <span style={{ fontSize: 11, color: ink3, fontWeight: 400 }}>(쉼표로 구분)</span></label>
              <input value={form.images} onChange={set('images')} placeholder="https://..., https://..."
                style={inputStyle(false)}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = divider; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Tags */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>태그 <span style={{ fontSize: 11, color: ink3, fontWeight: 400 }}>(쉼표로 구분)</span></label>
              <input value={form.tags} onChange={set('tags')} placeholder="신상품, 베스트, M3"
                style={inputStyle(false)}
                onFocus={e => { e.target.style.borderColor = cta; e.target.style.boxShadow = `0 0 0 3px rgba(0,113,227,0.14)` }}
                onBlur={e => { e.target.style.borderColor = divider; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* isActive */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <div onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  style={{ width: 44, height: 26, borderRadius: 13, background: form.isActive ? cta : '#D2D2D7', position: 'relative', transition: 'background 0.2s', flexShrink: 0, cursor: 'pointer' }}>
                  <div style={{ position: 'absolute', top: 3, left: form.isActive ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
                </div>
                <span style={{ fontSize: 13.5, color: ink }}>판매 활성화</span>
                <span style={{ fontSize: 12, color: form.isActive ? success : ink2 }}>
                  {form.isActive ? '판매 중' : '판매 중지'}
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: `0.5px solid ${divider}` }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, height: 44, background: bg2, border: `0.5px solid ${divider}`, borderRadius: 10, fontSize: 14, color: ink, cursor: 'pointer', fontFamily: 'inherit' }}>
              취소
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 2, height: 44, background: cta, border: 0, borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit', letterSpacing: '-0.005em' }}>
              {saving ? '저장 중…' : isEdit ? '수정 완료' : '상품 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Category badge ── */
const CAT_COLORS = {
  Mac: { bg: '#E8F0FE', text: '#1A56DB' },
  iPhone: { bg: '#FEF3C7', text: '#92400E' },
  iPad: { bg: '#D1FAE5', text: '#065F46' },
  'Apple Watch': { bg: '#EDE9FE', text: '#5B21B6' },
  AirPods: { bg: '#FCE7F3', text: '#9D174D' },
  Accessories: { bg: '#F3F4F6', text: '#374151' },
}
function CategoryBadge({ cat }) {
  const style = CAT_COLORS[cat] || CAT_COLORS.Accessories
  return (
    <span style={{ background: style.bg, color: style.text, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 6, letterSpacing: '-0.005em', whiteSpace: 'nowrap' }}>
      {cat}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════════════ */
export default function AdminProductsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const [products, setProducts]     = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const [modal, setModal]   = useState(null)   // null | 'create' | product-object
  const [confirmDel, setConfirmDel] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState({ visible: false, msg: '', kind: 'success' })

  const showToast = (msg, kind = 'success') => {
    setToast({ visible: true, msg, kind })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (search)      params.search   = search
      if (catFilter)   params.category = catFilter
      if (activeFilter !== '') params.isActive = activeFilter
      const { data } = await api.get('/products', { params })
      setProducts(data.products)
      setPagination(data.pagination)
    } catch {
      showToast('상품 목록을 불러오지 못했습니다.', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, catFilter, activeFilter])

  useEffect(() => { fetchProducts(1) }, [fetchProducts])

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (formData._id) {
        await api.put(`/products/${formData._id}`, formData)
        showToast('상품이 수정되었습니다.')
      } else {
        await api.post('/products', formData)
        showToast('상품이 등록되었습니다.')
      }
      setModal(null)
      fetchProducts(pagination.page)
    } catch (err) {
      const msg = err.response?.data?.message || '저장에 실패했습니다.'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${confirmDel._id}`)
      showToast('상품이 삭제되었습니다.')
      setConfirmDel(null)
      fetchProducts(pagination.page)
    } catch (err) {
      showToast(err.response?.data?.message || '삭제에 실패했습니다.', 'error')
    }
  }

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

          {/* 상품 관리 accordion */}
          <div>
            <div className="adm-nav-item active" style={{ cursor: 'default' }}>
              <span className="ico"><IconPackage /></span>상품 관리
              <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 6 6 6-6 6"/></svg>
              </span>
            </div>
            <div style={{ marginLeft: 14, paddingLeft: 12, borderLeft: '0.5px solid rgba(255,255,255,0.10)', marginTop: 2, marginBottom: 4 }}>
              <span style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 12.5, color: '#fff', background: 'rgba(255,255,255,0.08)', letterSpacing: '-0.005em' }}>상품 목록</span>
              <Link to="/admin/products/new"
                style={{ display: 'block', padding: '7px 10px', borderRadius: 6, fontSize: 12.5, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '-0.005em', transition: 'color 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                상품 등록
              </Link>
            </div>
          </div>

          <Link to="/admin/orders" className="adm-nav-item">
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
        <div className="adm-nav-foot">
          <div className="adm-avatar">{user?.name?.charAt(0) || 'A'}</div>
          <div className="adm-foot-text">
            <p className="nm">{user?.name || '관리자'}</p>
            <p className="em">{user?.email || ''}</p>
          </div>
          <button onClick={handleLogout} style={{ marginLeft: 'auto', background: 'none', border: 0, color: ink3, cursor: 'pointer', fontSize: 11, letterSpacing: '-0.005em' }}>로그아웃</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="adm-main">

        {/* Page header */}
        <div className="adm-head">
          <div>
            <p className="eyebrow">상품 관리</p>
            <h1 className="h-display h-28">Products</h1>
          </div>
          <Link to="/admin/products/new"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: 40, padding: '0 18px', background: ink, color: '#fff', border: 0, borderRadius: 980, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', letterSpacing: '-0.005em', fontFamily: 'inherit', textDecoration: 'none' }}>
            <IconPlus />새 상품 등록
          </Link>
        </div>

        {/* ── Filter bar ── */}
        <div style={{ background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: ink3, pointerEvents: 'none' }}><IconSearch /></span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="상품명, 설명 검색…"
              style={{ width: '100%', height: 36, padding: '0 12px 0 34px', border: `0.5px solid ${divider}`, borderRadius: 8, fontSize: 13, color: ink, background: bg2, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                style={{ height: 32, padding: '0 13px', borderRadius: 980, fontSize: 12, border: `0.5px solid ${catFilter === c ? ink : divider}`, background: catFilter === c ? ink : '#fff', color: catFilter === c ? '#fff' : ink2, cursor: 'pointer', letterSpacing: '-0.005em', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {c || '전체'}
              </button>
            ))}
          </div>

          {/* Active filter */}
          <select value={activeFilter} onChange={e => setActiveFilter(e.target.value)}
            style={{ height: 32, padding: '0 28px 0 10px', border: `0.5px solid ${divider}`, borderRadius: 8, fontSize: 12.5, color: ink, background: `#fff url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236E6E73' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 10px center`, appearance: 'none', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
            <option value="">전체 상태</option>
            <option value="true">판매 중</option>
            <option value="false">판매 중지</option>
          </select>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: ink2, whiteSpace: 'nowrap' }}>
            총 <strong style={{ color: ink }}>{pagination.total}</strong>개
          </span>
        </div>

        {/* ── Table ── */}
        <div style={{ background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 14, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 100px 90px 70px 70px 80px 90px', gap: '0 12px', padding: '10px 18px', borderBottom: `0.5px solid ${divider}`, background: bg2 }}>
            {['SKU', '상품명', '카테고리', '정가', '할인', '재고', '상태', ''].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 500, color: ink2, letterSpacing: '-0.005em', textTransform: h ? 'none' : undefined }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {loading ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: ink2, fontSize: 13 }}>불러오는 중…</div>
          ) : products.length === 0 ? (
            <div style={{ padding: '56px 0', textAlign: 'center' }}>
              <p style={{ color: ink2, fontSize: 14, margin: 0 }}>상품이 없습니다.</p>
              <Link to="/admin/products/new" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 18px', background: cta, color: '#fff', border: 0, borderRadius: 980, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>
                첫 상품 등록하기
              </Link>
            </div>
          ) : products.map((p, i) => (
            <div key={p._id} style={{
              display: 'grid', gridTemplateColumns: '90px 1fr 100px 90px 70px 70px 80px 90px',
              gap: '0 12px', padding: '13px 18px', alignItems: 'center',
              borderTop: i === 0 ? 'none' : `0.5px solid ${divider}`,
              transition: 'background 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = bg2}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: ink2, letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.sku}>{p.sku}</span>

              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: ink, letterSpacing: '-0.005em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                {p.tagline && <p style={{ margin: '2px 0 0', fontSize: 11.5, color: ink2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>}
              </div>

              <CategoryBadge cat={p.category} />

              <span style={{ fontSize: 13.5, fontWeight: 500, color: ink, letterSpacing: '-0.005em' }}>
                ₩{p.price.toLocaleString()}
              </span>

              <span style={{ fontSize: 13, color: p.discountRate > 0 ? '#FF9500' : ink3 }}>
                {p.discountRate > 0 ? `${p.discountRate}%` : '—'}
              </span>

              <span style={{ fontSize: 13.5, color: p.stock === 0 ? danger : p.stock < 10 ? '#FF9500' : ink }}>
                {p.stock}
              </span>

              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: p.isActive ? success : ink3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.isActive ? success : ink3, flexShrink: 0 }} />
                {p.isActive ? '판매 중' : '중지'}
              </span>

              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={() => navigate(`/admin/products/${p._id}/edit`)}
                  style={{ width: 30, height: 30, borderRadius: 8, background: bg2, border: `0.5px solid ${divider}`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: ink2 }}
                  title="수정">
                  <IconEdit />
                </button>
                <button onClick={() => setConfirmDel(p)}
                  style={{ width: 30, height: 30, borderRadius: 8, background: '#FFF5F5', border: `0.5px solid rgba(255,59,48,0.2)`, display: 'grid', placeItems: 'center', cursor: 'pointer', color: danger }}
                  title="삭제">
                  <IconTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pagination ── */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <button onClick={() => fetchProducts(pagination.page - 1)} disabled={pagination.page === 1}
              style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', border: `0.5px solid ${divider}`, display: 'grid', placeItems: 'center', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.4 : 1, color: ink }}>
              <IconChevronL />
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => fetchProducts(n)}
                style={{ width: 34, height: 34, borderRadius: 8, fontSize: 13, fontWeight: n === pagination.page ? 600 : 400, background: n === pagination.page ? ink : '#fff', color: n === pagination.page ? '#fff' : ink, border: `0.5px solid ${n === pagination.page ? ink : divider}`, cursor: 'pointer', fontFamily: 'inherit' }}>
                {n}
              </button>
            ))}
            <button onClick={() => fetchProducts(pagination.page + 1)} disabled={pagination.page === pagination.pages}
              style={{ width: 34, height: 34, borderRadius: 8, background: '#fff', border: `0.5px solid ${divider}`, display: 'grid', placeItems: 'center', cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.pages ? 0.4 : 1, color: ink }}>
              <IconChevronR />
            </button>
          </div>
        )}
      </main>

      {/* ── Modals ── */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
      {confirmDel && (
        <ConfirmDialog
          product={confirmDel}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <Toast msg={toast.msg} kind={toast.kind} visible={toast.visible} />
    </div>
  )
}
