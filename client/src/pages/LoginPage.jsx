import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

const SAVED_EMAIL_KEY = 'reapple.savedId'
const SAVED_FLAG_KEY  = 'reapple.rememberId'

/* ── Shared token values ── */
const ink  = '#1D1D1F'
const ink2 = '#6E6E73'
const ink3 = '#AEAEB2'
const cta  = '#0071E3'
const divider = '#D2D2D7'
const danger  = '#FF3B30'
const success = '#34C759'
const bg2 = '#F5F5F7'

/* ── Icon helpers ── */
const Svg = ({ size = 16, stroke = 1.7, children, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
)
const IconMail  = () => <Svg><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Svg>
const IconLock  = () => <Svg><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></Svg>
const IconEye   = () => <Svg><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></Svg>
const IconEyeOff = () => <Svg><path d="M2 2 22 22"/><path d="M6.7 6.8A11.5 11.5 0 0 0 2 12s4 7 10 7a10 10 0 0 0 5.5-1.6"/><path d="M9.9 5.1A11.5 11.5 0 0 1 12 5c6 0 10 7 10 7a17.8 17.8 0 0 1-3.2 4"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/></Svg>
const IconCheck = () => <Svg size={10} stroke={3}><path d="m5 12 5 5 9-11"/></Svg>
const IconArrow = () => <Svg size={13} stroke={2.2}><path d="M5 12h14M13 6l6 6-6 6"/></Svg>
const IconAlert = () => <Svg size={12} stroke={2.2}><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16h.01"/></Svg>
const IconBag   = () => <Svg size={14} stroke={1.7}><path d="M3 7h14l-1 12H4L3 7Z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/></Svg>

/* ── Apple logo ── */
const AppleLogo = ({ size = 18 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 20 24" fill={ink}>
    <path d="M14.3 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-2-1.5-.2-2.9.9-3.7.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.7 3-.4 7.5 1.3 9.9.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8 1.4 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1-.1-2.6-1-2.6-4ZM12 5.7c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3-1.4Z"/>
  </svg>
)

/* ── Toast ── */
function Toast({ msg, kind }) {
  const isError = kind === 'error'
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      background: ink, color: '#fff',
      borderRadius: 980, padding: '11px 18px 11px 14px',
      fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: '0 20px 50px -10px rgba(0,0,0,0.3)',
      zIndex: 80, whiteSpace: 'nowrap',
      animation: 'toastRise 0.3s cubic-bezier(.2,.7,.2,1) both',
    }}>
      <span style={{ color: isError ? danger : success, display: 'inline-flex' }}>
        <IconCheck />
      </span>
      {msg}
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()

  /* State */
  const savedEmail = localStorage.getItem(SAVED_EMAIL_KEY) || ''
  const savedFlag  = localStorage.getItem(SAVED_FLAG_KEY) === '1'
  const [form, setForm]         = useState({ email: savedEmail, password: '' })
  const [saveEmail, setSaveEmail] = useState(savedFlag)
  const [showPw, setShowPw]     = useState(false)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind })
    setTimeout(() => setToast(null), 2400)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '', submit: '' }))
  }

  const toggleSave = () => {
    const next = !saveEmail
    setSaveEmail(next)
    if (!next) {
      localStorage.removeItem(SAVED_EMAIL_KEY)
      localStorage.removeItem(SAVED_FLAG_KEY)
    }
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = '이메일을 입력하세요.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '올바른 이메일 형식이 아닙니다.'
    if (!form.password) e.password = '비밀번호를 입력하세요.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: form.email,
        password: form.password,
      })
      if (saveEmail) {
        localStorage.setItem(SAVED_EMAIL_KEY, form.email)
        localStorage.setItem(SAVED_FLAG_KEY, '1')
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
        localStorage.removeItem(SAVED_FLAG_KEY)
      }
      setToken(data.token)
      setUser(data.user)
      showToast('로그인 되었습니다')
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      const message = err.response?.data?.message || '로그인에 실패했습니다.'
      setErrors({ submit: message })
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  /* ── Input style factory ── */
  const inputStyle = (hasErr) => ({
    width: '100%', height: 46,
    padding: '12px 14px 12px 42px',
    borderRadius: 10, border: 0,
    boxShadow: hasErr
      ? `inset 0 0 0 1px ${danger}, 0 0 0 4px rgba(255,59,48,0.10)`
      : `inset 0 0 0 0.5px ${divider}`,
    background: '#fff', color: ink,
    fontSize: 14.5, outline: 'none',
    letterSpacing: '-0.005em',
    transition: 'box-shadow 0.15s ease',
    fontFamily: 'inherit',
  })

  /* ── Checkbox visual ── */
  const CheckBox = ({ checked, onClick, label }) => (
    <label onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', fontSize: 13, color: ink, letterSpacing: '-0.005em' }}>
      <span style={{
        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
        border: checked ? `1.5px solid ${cta}` : `1.5px solid ${divider}`,
        background: checked ? cta : '#fff',
        display: 'inline-grid', placeItems: 'center',
        transition: 'background 0.15s, border-color 0.15s',
      }}>
        <span style={{ color: '#fff', opacity: checked ? 1 : 0, transition: 'opacity 0.15s', display: 'inline-flex' }}>
          <IconCheck />
        </span>
      </span>
      {label}
    </label>
  )

  return (
    <div style={{ margin: 0, padding: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: bg2, color: ink,
      fontFamily: '"SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif',
      fontSize: 15, lineHeight: 1.45, WebkitFontSmoothing: 'antialiased',
    }}>
      <style>{`
        @keyframes rise { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes toastRise { from { opacity:0; transform:translateX(-50%) translateY(20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .login-input:focus { box-shadow: inset 0 0 0 1px ${cta}, 0 0 0 4px rgba(0,113,227,0.14) !important; }
        .login-input::placeholder { color: ${ink3}; }
        .login-eye:hover { color: ${ink}; background: ${bg2}; }
        .find-link { color: ${ink2}; text-decoration: none; font-size: 13px; }
        .find-link:hover { color: ${ink}; }
        .sns-circle { transition: transform 0.15s, border-color 0.15s; }
        .sns-circle:hover { transform: translateY(-1px); border-color: ${ink3}; }
        @media (max-width: 640px) {
          .login-card-row { padding: 22px 20px !important; }
          .login-form-row { flex-direction: column !important; }
          .login-field { grid-template-columns: 1fr !important; }
          .login-foot { padding-left: 0 !important; flex-wrap: wrap; gap: 10px !important; }
          .login-btn { width: 100% !important; height: 48px !important; }
          .login-err { margin-left: 0 !important; }
          .welcome-row { flex-direction: column !important; align-items: stretch !important; text-align: center; gap: 14px !important; }
          .sns-row { flex-direction: column !important; align-items: stretch !important; gap: 14px !important; }
          .sns-caption { width: auto !important; text-align: center; }
          .login-brand { font-size: 22px !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50, height: 48,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        boxShadow: `inset 0 -0.5px 0 ${divider}`,
      }}>
        <div style={{ maxWidth: 1200, height: '100%', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: ink }}>
            <AppleLogo size={18} />
            <span style={{ fontFamily: '"SF Pro Display",-apple-system,sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>
              ReApple
            </span>
          </Link>
          <span style={{ fontSize: 13, color: ink2 }}>
            처음이신가요?{' '}
            <Link to="/register" style={{ color: cta, textDecoration: 'none', marginLeft: 4 }}>회원가입</Link>
          </span>
        </div>
      </header>

      {/* ── Page ── */}
      <main style={{
        flex: 1,
        display: 'grid', placeItems: 'center',
        padding: '56px 24px 80px',
        background: `radial-gradient(900px 500px at 50% -10%, rgba(0,113,227,0.06), transparent 60%), ${bg2}`,
      }}>
        <div style={{ width: '100%', maxWidth: 720, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Brand mark */}
          <h1 className="login-brand" style={{
            fontFamily: '"SF Pro Display",-apple-system,BlinkMacSystemFont,sans-serif',
            fontSize: 28, fontWeight: 600, letterSpacing: '0.32em',
            color: ink, margin: '0 0 28px', paddingLeft: '0.32em',
          }}>
            L O G I N
          </h1>

          {/* ── Card ── */}
          <section style={{
            width: '100%', background: '#FFFFFF',
            border: `0.5px solid ${divider}`,
            borderRadius: 20, overflow: 'hidden',
            animation: 'rise 0.6s cubic-bezier(.2,.7,.2,1) both',
          }}>

            {/* ─── Row 1: Login form ─── */}
            <form className="login-card-row" onSubmit={handleSubmit} noValidate
              style={{ padding: '26px 32px' }}>

              <div className="login-form-row" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Fields */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Email */}
                  <div className="login-field" style={{ display: 'grid', gridTemplateColumns: '92px 1fr', alignItems: 'center', gap: 12 }}>
                    <label htmlFor="f-email" style={{ fontSize: 13, color: ink, fontWeight: 500, letterSpacing: '-0.005em' }}>
                      이메일 아이디
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: ink3, display: 'inline-flex', pointerEvents: 'none', transition: 'color 0.15s' }}>
                        <IconMail />
                      </span>
                      <input
                        id="f-email" name="email" type="email"
                        placeholder="이메일 아이디를 @까지 정확히 입력"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        className="login-input"
                        style={inputStyle(!!errors.email)}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="login-field" style={{ display: 'grid', gridTemplateColumns: '92px 1fr', alignItems: 'center', gap: 12 }}>
                    <label htmlFor="f-password" style={{ fontSize: 13, color: ink, fontWeight: 500, letterSpacing: '-0.005em' }}>
                      비밀번호
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: ink3, display: 'inline-flex', pointerEvents: 'none' }}>
                        <IconLock />
                      </span>
                      <input
                        id="f-password" name="password"
                        type={showPw ? 'text' : 'password'}
                        placeholder="영문 + 숫자 + 특수문자 조합 8자 이상"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        className="login-input"
                        style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)}
                        className="login-eye"
                        style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, width: 32, height: 32, display: 'inline-grid', placeItems: 'center', color: ink2, borderRadius: 8, cursor: 'pointer', transition: 'color 0.15s, background 0.15s' }}
                        aria-label="비밀번호 표시">
                        {showPw ? <IconEye /> : <IconEyeOff />}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Login button */}
                <button type="submit" disabled={loading}
                  className="login-btn"
                  style={{
                    alignSelf: 'stretch', width: 132,
                    background: loading ? '#d6d6db' : cta,
                    color: '#fff', border: 0, borderRadius: 14,
                    fontFamily: '"SF Pro Display",-apple-system,sans-serif',
                    fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
                    boxShadow: loading ? 'none' : '0 8px 24px -6px rgba(0,113,227,0.4)',
                    transition: 'filter 0.15s, transform 0.15s',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
                  onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = 'scale(0.99)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'none' }}>
                  {loading ? '확인 중…' : '로그인'}
                </button>
              </div>

              {/* Error */}
              {(errors.email || errors.password || errors.submit) && (
                <p className="login-err" style={{ margin: '6px 0 0 104px', fontSize: 12, color: danger, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <IconAlert />
                  {errors.submit || errors.email || errors.password}
                </p>
              )}

              {/* Save email + find links */}
              <div className="login-foot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingLeft: 104 }}>
                <CheckBox
                  checked={saveEmail}
                  onClick={toggleSave}
                  label="이메일 아이디 저장"
                />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                  <a href="#" className="find-link">아이디 찾기</a>
                  <span style={{ color: ink3 }}>|</span>
                  <a href="#" className="find-link">비밀번호 찾기</a>
                </span>
              </div>
            </form>

            {/* ─── Row 2: Welcome / sign up ─── */}
            <div className="login-card-row welcome-row"
              style={{ padding: '26px 32px', borderTop: `0.5px solid ${divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <p style={{ fontSize: 14, color: ink2, letterSpacing: '-0.005em', margin: 0 }}>
                지금 가입하면 <strong style={{ color: ink, fontWeight: 600 }}>최대 <span style={{ color: cta }}>40%</span> 웰컴 패키지</strong> 지급
              </p>
              <Link to="/register" style={{
                background: '#fff', color: ink,
                border: `0.5px solid ${divider}`, borderRadius: 980,
                height: 44, padding: '0 22px',
                fontSize: 14, fontWeight: 500, letterSpacing: '-0.005em',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'background 0.15s, border-color 0.15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = bg2; e.currentTarget.style.borderColor = ink3 }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = divider }}>
                이메일로 가입하기
                <span style={{ color: cta, display: 'inline-flex' }}><IconArrow /></span>
              </Link>
            </div>

            {/* ─── Row 3: SNS ─── */}
            <div className="login-card-row sns-row"
              style={{ padding: '26px 32px', borderTop: `0.5px solid ${divider}`, display: 'flex', alignItems: 'center', gap: 22 }}>
              <p className="sns-caption" style={{ width: 110, fontSize: 13, color: ink2, lineHeight: 1.45, letterSpacing: '-0.005em', flexShrink: 0, margin: 0 }}>
                SNS 계정으로<br />이용해 보세요.
              </p>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Kakao */}
                <button type="button" style={{
                  width: '100%', height: 48,
                  background: '#FEE500', border: 0, borderRadius: 12,
                  color: '#3C1E1E', fontWeight: 600, fontSize: 14, letterSpacing: '-0.005em',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', transition: 'filter 0.15s', fontFamily: 'inherit',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.97)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#3C1E1E">
                    <path d="M12 4c5 0 9 3 9 7 0 4-4 7-9 7-1 0-2 0-3-.3L5 20l1-3c-2-1.4-3-3.4-3-5.6 0-4 4-7 9-7Z"/>
                  </svg>
                  카카오로 시작하기
                </button>
                {/* Social circles */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  {/* Naver */}
                  <button type="button" aria-label="네이버" className="sns-circle"
                    style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: '#03C75A', color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: '"SF Pro Display",-apple-system,sans-serif', cursor: 'pointer', display: 'inline-grid', placeItems: 'center' }}>
                    N
                  </button>
                  {/* Facebook */}
                  <button type="button" aria-label="페이스북" className="sns-circle"
                    style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: '#1877F2', color: '#fff', cursor: 'pointer', display: 'inline-grid', placeItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.5 21v-7.5h2.5l.4-3H13.5v-2c0-.9.3-1.5 1.5-1.5h1.4V4.3c-.2 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6V10.5H8.3v3h2.5V21h2.7Z"/>
                    </svg>
                  </button>
                  {/* Instagram */}
                  <button type="button" aria-label="인스타그램" className="sns-circle"
                    style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'radial-gradient(circle at 30% 110%, #fdcb52 0%, #ee2a7b 50%, #6228d7 100%)', color: '#fff', cursor: 'pointer', display: 'inline-grid', placeItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>
                  {/* Google */}
                  <button type="button" aria-label="구글" className="sns-circle"
                    style={{ width: 38, height: 38, borderRadius: '50%', border: `0.5px solid ${divider}`, background: '#fff', cursor: 'pointer', display: 'inline-grid', placeItems: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3a12 12 0 1 1-3.3-13l5.7-5.7A20 20 0 1 0 44 24c0-1.4-.1-2.7-.4-4Z"/>
                      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 8 3l5.6-5.6A20 20 0 0 0 6.3 14.7Z"/>
                      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 13 27l-6.6 5.1A20 20 0 0 0 24 44Z"/>
                      <path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37.6 38 44 32 44 24c0-1.4-.1-2.7-.4-4Z"/>
                    </svg>
                  </button>
                  {/* Apple */}
                  <button type="button" aria-label="애플" className="sns-circle"
                    style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: ink, color: '#fff', cursor: 'pointer', display: 'inline-grid', placeItems: 'center', fontSize: 18 }}>
                    &#63743;
                  </button>
                </div>
              </div>
            </div>

            {/* ─── Row 4: Guest ─── */}
            <div className="login-card-row"
              style={{ padding: '26px 32px', borderTop: `0.5px solid ${divider}`, display: 'flex', justifyContent: 'center' }}>
              <button type="button"
                style={{
                  background: '#fff', color: ink,
                  border: `0.5px solid ${divider}`, borderRadius: 12,
                  padding: '12px 28px', fontSize: 14, letterSpacing: '-0.005em',
                  minWidth: 280, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s', fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = bg2; e.currentTarget.style.borderColor = ink3 }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = divider }}>
                <IconBag />
                비회원 주문조회
              </button>
            </div>

          </section>
        </div>
      </main>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} kind={toast.kind} />}
    </div>
  )
}
