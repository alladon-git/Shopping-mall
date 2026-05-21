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
/* ── 포트원 결제수단 매핑 ── */
const PAY_CONFIG = {
  card:          { channelKey: 'channel-key-205aeca2-7c10-4104-b853-51e9431021ba', pay_method: 'card' },
  bank_transfer: { channelKey: 'channel-key-205aeca2-7c10-4104-b853-51e9431021ba', pay_method: 'trans' },
  kakao_pay:     { channelKey: 'channel-key-205aeca2-7c10-4104-b853-51e9431021ba', pay_method: 'card' },
}

const IcoChevL   = () => <Svg size={16} stroke={2}><path d="m15 18-6-6 6-6"/></Svg>
const IcoChevR   = () => <Svg size={12} stroke={2.5}><path d="m9 18 6-6-6-6"/></Svg>
const IcoCheck   = () => <Svg size={14} stroke={2.5}><path d="m5 12 5 5 9-11"/></Svg>
const IcoTruck   = () => <Svg size={16} stroke={1.6}><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></Svg>
const IcoCard    = () => <Svg size={16} stroke={1.6}><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></Svg>
const IcoBank    = () => <Svg size={16} stroke={1.6}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Svg>
const IcoKakao   = () => <Svg size={16} stroke={1.6}><path d="M12 3C6.48 3 2 6.69 2 11.25c0 2.9 1.9 5.45 4.77 6.94L5.5 21l4.13-2.17c.77.11 1.56.17 2.37.17 5.52 0 10-3.69 10-8.25S17.52 3 12 3z"/></Svg>
const IcoSpin    = () => <Svg size={18} stroke={2}><path d="M21 12a9 9 0 1 1-6.22-8.56"/></Svg>
const IcoCircle  = () => <Svg size={18} stroke={1.8}><circle cx="12" cy="12" r="10"/></Svg>

const AppleLogo = () => (
  <svg width={16} height={19} viewBox="0 0 20 24" fill={ink}>
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── 입력 컴포넌트 ── */
function Field({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: error ? danger : ink2 }}>
        {label}{required && <span style={{ color: danger, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 12, color: danger }}>{error}</span>}
    </div>
  )
}

function Input({ error, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        height: 44, padding: '0 14px', borderRadius: 10, fontSize: 15,
        border: `1px solid ${error ? danger : focused ? cta : divider}`,
        outline: 'none', fontFamily: 'inherit', color: ink,
        background: '#fff', transition: 'border-color 0.15s', width: '100%', boxSizing: 'border-box',
      }}
    />
  )
}

/* ── 결제 수단 카드 ── */
function PayMethod({ id, icon, label, desc, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px 18px', borderRadius: 12, width: '100%', textAlign: 'left',
        border: `1.5px solid ${selected ? cta : divider}`,
        background: selected ? '#EEF5FF' : '#fff',
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'border-color 0.15s, background 0.15s',
      }}>
      <span style={{ color: selected ? cta : ink2, display: 'inline-flex', flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: ink }}>{label}</p>
        {desc && <p style={{ margin: '2px 0 0', fontSize: 12, color: ink2 }}>{desc}</p>}
      </div>
      <span style={{ color: selected ? cta : ink3, display: 'inline-flex' }}>
        {selected
          ? <Svg size={18} stroke={2.5}><path d="m5 12 5 5 9-11"/></Svg>
          : <IcoCircle />
        }
      </span>
    </button>
  )
}

/* ─────────────────────────────
   메인 컴포넌트
───────────────────────────── */
export default function OrderPage() {
  const navigate = useNavigate()
  const { token, user, setUser, logout } = useAuthStore()

  const [cart, setCart]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors]     = useState({})

  const [form, setForm] = useState({
    name: '', phone: '', zipCode: '', street: '', detail: '',
  })
  const [payMethod, setPayMethod] = useState('card')

  /* 포트원 IMP 초기화 */
  useEffect(() => {
    if (!window.IMP) {
      setErrors({ submit: '결제 모듈을 불러오지 못했습니다. 페이지를 새로고침해 주세요.' })
      return
    }
    window.IMP.init(import.meta.env.VITE_IMP_KEY)
  }, [])

  /* auth */
  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (!user) {
      api.get('/auth/me').then(({ data }) => setUser(data)).catch(() => logout())
    }
  }, [token])

  /* 장바구니 조회 */
  useEffect(() => {
    if (!token) return
    api.get('/cart')
      .then(({ data }) => {
        if (!data.items || data.items.length === 0) {
          navigate('/cart')
          return
        }
        setCart(data)
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false))
  }, [token])

  /* 유저 기본 정보 자동 채우기 */
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name || '', phone: f.phone || user.phone || '' }))
  }, [user])

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
    setErrors((er) => ({ ...er, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = '이름을 입력해 주세요.'
    if (!form.phone.trim())   e.phone   = '연락처를 입력해 주세요.'
    if (!form.zipCode.trim()) e.zipCode = '우편번호를 입력해 주세요.'
    if (!form.street.trim())  e.street  = '주소를 입력해 주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    if (!window.IMP) {
      setErrors({ submit: '결제 모듈이 로드되지 않았습니다. 페이지를 새로고침해 주세요.' })
      return
    }

    setSubmitting(true)
    setErrors({})

    const merchantUid = `order_${Date.now()}`
    const { channelKey, pay_method } = PAY_CONFIG[payMethod]

    window.IMP.request_pay(
      {
        channelKey,
        pay_method,
        merchant_uid: merchantUid,
        name: items.length === 1
          ? items[0].product.name
          : `${items[0].product.name} 외 ${items.length - 1}건`,
        amount: finalPrice,
        buyer_name:  form.name,
        buyer_tel:   form.phone,
        buyer_addr:  `${form.street} ${form.detail}`.trim(),
        buyer_postcode: form.zipCode,
      },
      async (rsp) => {
        if (!rsp.success) {
          setErrors({ submit: rsp.error_msg || '결제가 취소되었습니다.' })
          setSubmitting(false)
          return
        }

        /* 결제 성공 → 백엔드 주문 생성 */
        try {
          const { data } = await api.post('/orders', {
            shippingAddress: {
              name:    form.name,
              phone:   form.phone,
              zipCode: form.zipCode,
              street:  form.street,
              detail:  form.detail,
            },
            payment: {
              method:        payMethod,
              transactionId: rsp.imp_uid,
            },
          })
          navigate(`/order-complete/${data._id}`)
        } catch (err) {
          setErrors({ submit: err.response?.data?.message || '주문 생성에 실패했습니다. 고객센터에 문의해 주세요.' })
        } finally {
          setSubmitting(false)
        }
      }
    )
  }

  const items        = cart?.items ?? []
  const totalPrice   = cart?.totalPrice ?? 0
  const totalDiscount = cart?.totalDiscount ?? 0
  const finalPrice   = totalPrice

  return (
    <div style={{
      margin: 0, padding: 0, background: '#fff', color: ink,
      fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
      fontSize: 17, lineHeight: 1.45, WebkitFontSmoothing: 'antialiased', minHeight: '100vh',
    }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .order-anim { animation: fadeUp 0.45s cubic-bezier(.2,.7,.2,1) both; }
        @media(max-width:768px) {
          .order-layout  { flex-direction:column-reverse !important; }
          .order-summary { width:100% !important; position:static !important; }
        }
      `}</style>

      <Header navigate={navigate} />

      {/* 진행 단계 표시 */}
      <div style={{ borderBottom: `0.5px solid ${divider}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 44, fontSize: 13, color: ink3 }}>
            <button onClick={() => navigate('/cart')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cta, fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
              장바구니
            </button>
            <IcoChevR />
            <span style={{ color: ink, fontWeight: 500 }}>주문서</span>
            <IcoChevR />
            <span>주문 완료</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 96px' }}>
        <h1 style={{
          fontFamily: '"SF Pro Display",-apple-system,sans-serif',
          fontSize: 36, fontWeight: 600, letterSpacing: '-0.022em',
          margin: '0 0 36px', color: ink,
        }}>
          주문서
        </h1>

        {loading ? (
          <div style={{ color: ink3, fontSize: 15 }}>불러오는 중…</div>
        ) : (
          <div className="order-anim order-layout" style={{ display: 'flex', gap: 48, alignItems: 'flex-start' }}>

            {/* ── LEFT: 배송 + 결제 폼 ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 40 }}>

              {/* 배송 정보 */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ color: ink2 }}><IcoTruck /></span>
                  <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>
                    배송 정보
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="받는 분" required error={errors.name}>
                      <Input placeholder="이름" value={form.name} onChange={set('name')} error={errors.name} />
                    </Field>
                    <Field label="연락처" required error={errors.phone}>
                      <Input placeholder="010-0000-0000" value={form.phone} onChange={set('phone')} error={errors.phone} />
                    </Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 16 }}>
                    <Field label="우편번호" required error={errors.zipCode}>
                      <Input placeholder="12345" value={form.zipCode} onChange={set('zipCode')} error={errors.zipCode} />
                    </Field>
                    <Field label="도로명 주소" required error={errors.street}>
                      <Input placeholder="서울특별시 강남구 테헤란로 123" value={form.street} onChange={set('street')} error={errors.street} />
                    </Field>
                  </div>
                  <Field label="상세 주소">
                    <Input placeholder="아파트, 동/호수 등 (선택)" value={form.detail} onChange={set('detail')} />
                  </Field>
                </div>
              </section>

              <div style={{ borderTop: `0.5px solid ${divider}` }} />

              {/* 결제 수단 */}
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ color: ink2 }}><IcoCard /></span>
                  <h2 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em', margin: 0 }}>
                    결제 수단
                  </h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <PayMethod id="card"          icon={<IcoCard />}  label="신용 · 체크카드"  desc="국내외 모든 카드 사용 가능"  selected={payMethod === 'card'}          onSelect={setPayMethod} />
                  <PayMethod id="bank_transfer" icon={<IcoBank />}  label="계좌이체"          desc="실시간 계좌이체"             selected={payMethod === 'bank_transfer'} onSelect={setPayMethod} />
                  <PayMethod id="kakao_pay"     icon={<IcoKakao />} label="카카오페이"         desc="카카오페이로 간편 결제"      selected={payMethod === 'kakao_pay'}     onSelect={setPayMethod} />
                </div>
              </section>

              {/* 오류 메시지 */}
              {errors.submit && (
                <div style={{ background: '#FFF0F0', border: `1px solid ${danger}`, borderRadius: 10, padding: '14px 18px', fontSize: 14, color: danger }}>
                  {errors.submit}
                </div>
              )}
            </div>

            {/* ── RIGHT: 주문 요약 ── */}
            <div className="order-summary" style={{ width: 340, flexShrink: 0, position: 'sticky', top: 72 }}>
              <div style={{ background: bg2, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                <h3 style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 18, fontWeight: 600, margin: '0 0 18px', letterSpacing: '-0.015em' }}>
                  주문 상품 ({items.length}개)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  {items.map((item) => {
                    const p = item.product
                    return (
                      <div key={item._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', background: '#fff', border: `0.5px solid ${divider}`, flexShrink: 0 }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', background: divider }} />
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.name}
                          </p>
                          <p style={{ fontSize: 12, color: ink3, margin: '2px 0 0' }}>
                            {won(item.priceSnapshot.salePrice)} × {item.quantity}
                          </p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: ink, flexShrink: 0 }}>
                          {won(item.priceSnapshot.salePrice * item.quantity)}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div style={{ borderTop: `0.5px solid ${divider}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: ink2 }}>
                    <span>상품 금액</span><span>{won(totalPrice + totalDiscount)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: danger }}>
                      <span>할인</span><span>−{won(totalDiscount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: ink2 }}>
                    <span>배송비</span><span style={{ color: success, fontWeight: 500 }}>무료</span>
                  </div>
                  <div style={{ borderTop: `0.5px solid ${divider}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>최종 결제금액</span>
                    <span style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: ink }}>
                      {won(finalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 주문하기 버튼 */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: '100%', height: 52,
                  background: submitting ? ink3 : cta,
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: 17, fontWeight: 500, letterSpacing: '-0.01em',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'filter 0.15s, background 0.2s',
                  marginBottom: 14,
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.filter = 'brightness(1.08)' }}
                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}>
                {submitting
                  ? <><span style={{ display: 'inline-flex', animation: 'spin 0.8s linear infinite' }}><IcoSpin /></span> 처리 중…</>
                  : <>{won(finalPrice)} 결제하기</>
                }
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['개인정보는 주문 처리 목적으로만 사용됩니다.', '무료 배송 · 30일 이내 무료 반품'].map((t) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: ink3 }}>
                    <span style={{ color: success, display: 'inline-flex', marginTop: 1, flexShrink: 0 }}><IcoCheck /></span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

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

/* ── 공용 헤더 ── */
function Header({ navigate }) {
  return (
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
        <span style={{ fontSize: 14, color: ink2 }}>안전 결제</span>
      </div>
    </header>
  )
}
