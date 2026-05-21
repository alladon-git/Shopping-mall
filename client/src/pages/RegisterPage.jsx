import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

/* ── Design tokens ── */
const ink  = '#1D1D1F'
const ink2 = '#6E6E73'
const ink3 = '#AEAEB2'
const cta  = '#0071E3'
const divider = '#D2D2D7'
const danger  = '#FF3B30'
const success = '#34C759'
const warning = '#FF9500'
const bg2 = '#F5F5F7'

/* ── Icon helpers ── */
const Svg = ({ size = 16, stroke = 1.7, children, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
)
const IconUser  = () => <Svg><circle cx="12" cy="9" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></Svg>
const IconMail  = () => <Svg><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Svg>
const IconPhone = () => <Svg><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6A2 2 0 0 1 22 16.9Z"/></Svg>
const IconLock  = () => <Svg><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Svg>
const IconEye   = () => <Svg><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></Svg>
const IconEyeOff = () => <Svg><path d="M2 2 22 22"/><path d="M6.7 6.8A11.5 11.5 0 0 0 2 12s4 7 10 7a10 10 0 0 0 5.5-1.6"/><path d="M9.9 5.1A11.5 11.5 0 0 1 12 5c6 0 10 7 10 7a17.8 17.8 0 0 1-3.2 4"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/></Svg>
const IconCheck = ({ size = 12, strokeW = 3 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 5 5 9-11"/>
  </svg>
)

/* ── Apple logo ── */
const AppleLogo = ({ size = 18 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 20 24" fill={ink}>
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Toast ── */
function Toast({ msg, visible }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
      background: ink, color: '#fff',
      borderRadius: 980, padding: '11px 18px 11px 14px',
      fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
      opacity: visible ? 1 : 0, pointerEvents: 'none',
      transition: 'opacity 0.25s, transform 0.3s cubic-bezier(.2,.7,.2,1)',
      zIndex: 80, letterSpacing: '-0.005em',
    }}>
      <span style={{ color: success, display: 'inline-flex' }}>
        <IconCheck />
      </span>
      {msg}
    </div>
  )
}

/* ── Custom Checkbox ── */
function Checkbox({ checked }) {
  return (
    <span style={{
      width: 20, height: 20, borderRadius: 6,
      border: checked ? `1.5px solid ${cta}` : `1.5px solid ${divider}`,
      background: checked ? cta : '#fff',
      display: 'inline-grid', placeItems: 'center',
      flexShrink: 0,
      transition: 'background 0.15s, border-color 0.15s',
    }}>
      <span style={{ opacity: checked ? 1 : 0, transform: checked ? 'scale(1)' : 'scale(0.6)', transition: 'opacity 0.15s, transform 0.2s cubic-bezier(.2,.7,.2,1)', display: 'inline-flex', color: '#fff' }}>
        <IconCheck />
      </span>
    </span>
  )
}

/* ── Password strength ── */
function calcStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-zA-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^a-zA-Z\d]/.test(pw)) score++
  return score
}
const STRENGTH_LABELS = ['', '매우 약함', '약함', '보통', '강함']
const STRENGTH_COLORS = ['', danger, warning, cta, success]
const BAR_CLASS_COLORS = { 1: danger, 2: warning, 3: cta, 4: success }

function PwMeter({ pw }) {
  const score = pw ? calcStrength(pw) : 0
  const barColor = score > 0 ? BAR_CLASS_COLORS[score] : divider
  return (
    <>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 3,
            background: i <= score ? barColor : divider,
            transition: 'background 0.2s ease',
          }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: ink2, margin: '4px 0 0', letterSpacing: '-0.005em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>8자 이상, 영문 · 숫자 · 특수문자 포함</span>
        {score > 0 && <span style={{ fontWeight: 500, color: STRENGTH_COLORS[score] }}>{STRENGTH_LABELS[score]}</span>}
      </p>
    </>
  )
}

/* ── Field wrapper ── */
function Field({ label, required, icon, error, success: okMsg, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, color: ink, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4, letterSpacing: '-0.005em' }}>
        {label}
        {required && <span style={{ color: danger, fontWeight: 400 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: danger, margin: 0, letterSpacing: '-0.005em' }}>{error}</p>}
      {!error && okMsg && (
        <p style={{ fontSize: 12, color: success, margin: 0, display: 'inline-flex', alignItems: 'center', gap: 5, letterSpacing: '-0.005em' }}>
          <IconCheck /> {okMsg}
        </p>
      )}
      {!error && !okMsg && hint && <p style={{ fontSize: 12, color: ink2, margin: 0, letterSpacing: '-0.005em' }}>{hint}</p>}
    </div>
  )
}

/* ── Input with icon ── */
function IconInput({ icon, rightBtn, value, onChange, type = 'text', placeholder, autoComplete, maxLength, inputState }) {
  const borderColor = inputState === 'error' ? danger : inputState === 'success' ? success : divider
  const shadowOuter = inputState === 'error' ? 'rgba(255,59,48,0.10)' : inputState === 'success' ? 'rgba(52,199,89,0.10)' : 'transparent'
  const shadowInner = inputState === 'error' ? `inset 0 0 0 1px ${danger}` : inputState === 'success' ? `inset 0 0 0 1px ${success}` : `inset 0 0 0 0.5px ${divider}`
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: ink3, display: 'inline-flex', pointerEvents: 'none' }}>
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        style={{
          width: '100%', height: 46,
          padding: rightBtn ? '12px 44px 12px 42px' : '12px 14px 12px 42px',
          borderRadius: 10, border: 0,
          boxShadow: inputState ? `${shadowInner}, 0 0 0 4px ${shadowOuter}` : `inset 0 0 0 0.5px ${divider}`,
          background: '#fff', color: ink,
          fontSize: 14.5, outline: 'none',
          letterSpacing: '-0.005em',
          transition: 'box-shadow 0.15s ease',
          fontFamily: 'inherit',
        }}
        onFocus={e => {
          if (!inputState) e.target.style.boxShadow = `inset 0 0 0 1px ${cta}, 0 0 0 4px rgba(0,113,227,0.14)`
        }}
        onBlur={e => {
          if (!inputState) e.target.style.boxShadow = `inset 0 0 0 0.5px ${divider}`
          else if (inputState === 'error') e.target.style.boxShadow = `inset 0 0 0 1px ${danger}, 0 0 0 4px rgba(255,59,48,0.10)`
          else e.target.style.boxShadow = `inset 0 0 0 1px ${success}, 0 0 0 4px rgba(52,199,89,0.10)`
        }}
      />
      {rightBtn}
    </div>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^010-\d{4}-\d{4}$/

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw]   = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [touched, setTouched] = useState({})
  const [agreements, setAgreements] = useState({ terms: false, privacy: false, marketing: false })
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [toast, setToast] = useState({ visible: false, msg: '' })

  const showToast = (msg) => {
    setToast({ visible: true, msg })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400)
  }

  const set = (key) => (e) => {
    let val = e.target.value
    if (key === 'phone') {
      val = val.replace(/[^\d]/g, '').slice(0, 11)
      if (val.length > 7) val = val.slice(0,3) + '-' + val.slice(3,7) + '-' + val.slice(7)
      else if (val.length > 3) val = val.slice(0,3) + '-' + val.slice(3)
    }
    setForm(f => ({ ...f, [key]: val }))
    setSubmitError('')
  }
  const touch = (key) => () => setTouched(t => ({ ...t, [key]: true }))

  const errors = {
    name: !form.name.trim() ? '이름을 입력해 주세요.' : '',
    email: !form.email.trim() ? '이메일을 입력해 주세요.' : !EMAIL_RE.test(form.email) ? '올바른 이메일을 입력해 주세요.' : '',
    phone: !form.phone.trim() ? '전화번호를 입력해 주세요.' : !PHONE_RE.test(form.phone) ? '전화번호를 정확히 입력해 주세요.' : '',
    password: calcStrength(form.password) < 4 ? '비밀번호 조건을 만족해야 합니다.' : '',
    confirmPassword: form.confirmPassword.length > 0 && form.password !== form.confirmPassword ? '비밀번호가 일치하지 않습니다.' : '',
  }
  const okEmail  = !errors.email && form.email.length > 0
  const okConfirm = form.confirmPassword.length > 0 && form.password === form.confirmPassword

  const fieldState = (key) => {
    if (!touched[key] && !submitError) return undefined
    return errors[key] ? 'error' : 'success'
  }

  const allAgreesOk = agreements.terms && agreements.privacy
  const pwScore = calcStrength(form.password)
  const formValid = !errors.name && !errors.email && !errors.phone && pwScore >= 4 &&
    okConfirm && allAgreesOk

  const toggleAgree = (key) => {
    if (key === 'all') {
      const v = !(agreements.terms && agreements.privacy && agreements.marketing)
      setAgreements({ terms: v, privacy: v, marketing: v })
    } else {
      setAgreements(a => ({ ...a, [key]: !a[key] }))
    }
  }
  const allChecked = agreements.terms && agreements.privacy && agreements.marketing

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true })
    if (!formValid) {
      showToast('입력 정보를 확인해 주세요')
      return
    }
    setLoading(true)
    setSubmitError('')
    try {
      await api.post('/users', {
        email: form.email,
        name: form.name,
        password: form.password,
        phone: form.phone,
        userType: 'customer',
      })
      showToast('가입이 완료되었습니다')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      const msg = err.response?.data?.message || '회원가입에 실패했습니다.'
      setSubmitError(msg)
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F7', color: ink, fontFamily: '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        height: 48, background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: `inset 0 -0.5px 0 ${divider}`,
      }}>
        <div style={{ maxWidth: 1200, height: '100%', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: ink, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
            <AppleLogo size={18} />
            ReApple
          </button>
          <span style={{ fontSize: 13, color: ink2 }}>
            이미 회원이세요?{' '}
            <Link to="/login" style={{ color: cta, textDecoration: 'none', marginLeft: 4 }}>로그인</Link>
          </span>
        </div>
      </header>

      {/* ── Page ── */}
      <main style={{
        minHeight: 'calc(100vh - 48px)',
        display: 'grid', placeItems: 'center',
        padding: '56px 24px 80px',
        background: 'radial-gradient(1000px 600px at 50% -10%, rgba(0,113,227,0.06), transparent 60%), #F5F5F7',
      }}>
        <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Brand mark */}
          <div style={{
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: 22, fontWeight: 600, letterSpacing: '0.32em',
            color: ink, margin: '0 0 28px',
            display: 'inline-flex', alignItems: 'center', gap: 12,
          }}>
            <AppleLogo size={24} />
            <span>R E A P P L E</span>
          </div>

          {/* Card */}
          <form onSubmit={handleSubmit} noValidate style={{
            width: '100%',
            background: '#FFFFFF',
            border: `0.5px solid ${divider}`,
            borderRadius: 20,
            padding: '40px 36px 32px',
            animation: 'rise 0.6s cubic-bezier(.2,.7,.2,1) both',
          }}>
            <style>{`@keyframes rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>

            {/* Card header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.022em', color: ink, margin: '0 0 8px' }}>회원가입</h1>
              <p style={{ fontSize: 14, color: ink2, margin: 0, letterSpacing: '-0.005em' }}>새로운 계정을 만들어 쇼핑을 시작하세요</p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* 이름 */}
              <Field label="이름" required error={touched.name && errors.name}>
                <IconInput
                  icon={<IconUser />}
                  value={form.name}
                  onChange={set('name')}
                  onBlur={touch('name')}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                  inputState={fieldState('name')}
                />
              </Field>

              {/* 이메일 */}
              <Field label="이메일" required
                error={touched.email && errors.email}
                success={touched.email && okEmail ? '사용 가능한 이메일입니다.' : ''}>
                <IconInput
                  icon={<IconMail />}
                  value={form.email}
                  onChange={set('email')}
                  onBlur={touch('email')}
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  inputState={touched.email ? (errors.email ? 'error' : okEmail ? 'success' : undefined) : undefined}
                />
              </Field>

              {/* 전화번호 */}
              <Field label="전화번호" required error={touched.phone && errors.phone}>
                <IconInput
                  icon={<IconPhone />}
                  value={form.phone}
                  onChange={set('phone')}
                  onBlur={touch('phone')}
                  type="tel"
                  placeholder="010-1234-5678"
                  autoComplete="tel"
                  maxLength={13}
                  inputState={touched.phone ? (errors.phone ? 'error' : form.phone.length > 0 ? 'success' : undefined) : undefined}
                />
              </Field>

              {/* 비밀번호 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, color: ink, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4, letterSpacing: '-0.005em' }}>
                  비밀번호<span style={{ color: danger, fontWeight: 400 }}>*</span>
                </label>
                <IconInput
                  icon={<IconLock />}
                  value={form.password}
                  onChange={set('password')}
                  onBlur={touch('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="new-password"
                  inputState={touched.password ? (errors.password ? 'error' : 'success') : undefined}
                  rightBtn={
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, width: 32, height: 32, display: 'inline-grid', placeItems: 'center', color: ink2, borderRadius: 8, cursor: 'pointer' }}>
                      {showPw ? <IconEye /> : <IconEyeOff />}
                    </button>
                  }
                />
                <PwMeter pw={form.password} />
                {touched.password && errors.password && (
                  <p style={{ fontSize: 12, color: danger, margin: 0, letterSpacing: '-0.005em' }}>{errors.password}</p>
                )}
              </div>

              {/* 비밀번호 확인 */}
              <Field label="비밀번호 확인" required
                error={touched.confirmPassword && errors.confirmPassword}
                success={touched.confirmPassword && okConfirm ? '비밀번호가 일치합니다.' : ''}>
                <IconInput
                  icon={<IconLock />}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  onBlur={touch('confirmPassword')}
                  type={showPw2 ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  autoComplete="new-password"
                  inputState={touched.confirmPassword ? (errors.confirmPassword ? 'error' : okConfirm ? 'success' : undefined) : undefined}
                  rightBtn={
                    <button type="button" onClick={() => setShowPw2(p => !p)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, width: 32, height: 32, display: 'inline-grid', placeItems: 'center', color: ink2, borderRadius: 8, cursor: 'pointer' }}>
                      {showPw2 ? <IconEye /> : <IconEyeOff />}
                    </button>
                  }
                />
              </Field>

            </div>

            {/* ── Agreements ── */}
            <div style={{ marginTop: 22, paddingTop: 22, borderTop: `0.5px solid ${divider}`, display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* 전체 동의 */}
              <div onClick={() => toggleAgree('all')} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                userSelect: 'none', cursor: 'pointer',
                padding: '10px 12px', background: bg2, borderRadius: 10, marginBottom: 6,
              }}>
                <Checkbox checked={allChecked} />
                <span style={{ flex: 1, fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif', fontWeight: 600, fontSize: 14.5, color: ink, letterSpacing: '-0.005em' }}>전체 동의</span>
              </div>

              {[
                { key: 'terms',   label: '이용약관 동의', required: true },
                { key: 'privacy', label: '개인정보처리방침 동의', required: true },
                { key: 'marketing', label: '마케팅 정보 수신 동의', required: false },
              ].map(({ key, label, required: req }) => (
                <div key={key} onClick={() => toggleAgree(key)} style={{ display: 'flex', alignItems: 'center', gap: 10, userSelect: 'none', cursor: 'pointer', padding: '4px 0' }}>
                  <Checkbox checked={agreements[key]} />
                  <span style={{ flex: 1, fontSize: 13.5, color: ink, letterSpacing: '-0.005em' }}>
                    {label} <span style={{ fontSize: 11, color: ink2 }}>({req ? '필수' : '선택'})</span>
                  </span>
                  {req && (
                    <span onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: ink2, cursor: 'pointer', textDecoration: 'none' }}>보기</span>
                  )}
                </div>
              ))}
            </div>

            {/* ── Submit ── */}
            <button type="submit" disabled={loading}
              style={{
                marginTop: 22, width: '100%',
                background: formValid ? cta : '#d6d6db',
                color: '#fff', border: 0,
                padding: '14px 20px', borderRadius: 12,
                fontSize: 15, fontWeight: 500, letterSpacing: '-0.005em',
                cursor: loading || !formValid ? 'not-allowed' : 'pointer',
                transition: 'filter 0.15s, background 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (formValid && !loading) e.currentTarget.style.filter = 'brightness(1.08)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = '' }}
            >
              {loading ? '가입 처리 중…' : '회원가입'}
            </button>

            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: ink2, letterSpacing: '-0.005em' }}>
              이미 계정이 있으신가요?{' '}
              <Link to="/login" style={{ color: cta, fontWeight: 500, textDecoration: 'none' }}>로그인</Link>
            </p>

            {/* ── OAuth ── */}
            <div style={{ marginTop: 22, paddingTop: 22, borderTop: `0.5px solid ${divider}` }}>
              <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: ink2, margin: '0 0 12px' }}>또는 간편 가입</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {/* Apple */}
                <button type="button" style={{ height: 44, background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: ink, cursor: 'pointer', letterSpacing: '-0.005em', fontFamily: 'inherit' }}>
                  <AppleLogo size={14} /><span>Apple</span>
                </button>
                {/* Google */}
                <button type="button" style={{ height: 44, background: '#fff', border: `0.5px solid ${divider}`, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: ink, cursor: 'pointer', letterSpacing: '-0.005em', fontFamily: 'inherit' }}>
                  <svg width={14} height={14} viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3a12 12 0 1 1-3.3-13l5.7-5.7A20 20 0 1 0 44 24c0-1.4-.1-2.7-.4-4Z"/>
                    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 8 3l5.6-5.6A20 20 0 0 0 6.3 14.7Z"/>
                    <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 13 27l-6.6 5.1A20 20 0 0 0 24 44Z"/>
                    <path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37.6 38 44 32 44 24c0-1.4-.1-2.7-.4-4Z"/>
                  </svg>
                  <span>Google</span>
                </button>
                {/* Kakao */}
                <button type="button" style={{ height: 44, background: '#FEE500', border: '0.5px solid #FEE500', borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, color: '#3C1E1E', cursor: 'pointer', letterSpacing: '-0.005em', fontFamily: 'inherit' }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="#3C1E1E" aria-hidden="true">
                    <path d="M12 4c5 0 9 3 9 7 0 4-4 7-9 7-1 0-2 0-3-.3L5 20l1-3c-2-1.4-3-3.4-3-5.6 0-4 4-7 9-7Z"/>
                  </svg>
                  <span>Kakao</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      </main>

      <Toast msg={toast.msg} visible={toast.visible} />
    </div>
  )
}

export default RegisterPage
