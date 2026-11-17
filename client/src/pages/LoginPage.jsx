import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/auth.js'

/** Only allow same-app relative redirects (blocks //evil.com). */
function safeNext(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

function Brand({ className }) {
  return (
    <div className={className}>
      <span className="brand-mark">S</span>
      <span>seat<span className="brand-dot">.</span>kmutt</span>
    </div>
  )
}

export default function LoginPage() {
  const { status, login } = useAuth()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  if (status === 'loading') return <p className="page-loading">กำลังตรวจสอบการเข้าสู่ระบบ…</p>
  if (status === 'authenticated') return <Navigate to={safeNext(params.get('next'))} replace />

  async function submitLogin(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      await login(String(form.get('email')).trim(), String(form.get('password')))
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-visual" aria-label="แนะนำบริการ">
        <Brand className="auth-brand" />
        <div className="visual-copy">
          <p className="eyebrow">พื้นที่ของคุณ เวลาเพื่อการโฟกัส</p>
          <h1>หาที่นั่งที่ใช่<br />แล้วเริ่มทำสิ่งสำคัญ</h1>
          <p>ค้นหาและจองพื้นที่อ่านหนังสือ ห้องประชุม และพื้นที่ทำงานภายในมหาวิทยาลัย</p>
          <div className="visual-points">
            <span><b>01</b> ดูความหนาแน่นแบบเรียลไทม์</span>
            <span><b>02</b> เลือกเวลาและที่นั่ง</span>
            <span><b>03</b> ชวนเพื่อนจองห้องประชุมด้วย QR code</span>
          </div>
        </div>
        <p className="visual-footer">สำหรับนักศึกษาและบุคลากร KMUTT</p>
      </section>

      <section className="auth-side">
        <Brand className="auth-mobile-brand" />
        <div className="login-card">
          <p className="eyebrow">ยินดีต้อนรับ</p>
          <h1>เข้าสู่ระบบ</h1>
          <p className="login-intro">ใช้บัญชี KMUTT เพื่อค้นหาและจองพื้นที่ของคุณ</p>
          <form onSubmit={submitLogin}>
            <label>
              อีเมลมหาวิทยาลัย
              <input
                autoComplete="username"
                name="email"
                type="email"
                placeholder="name@mail.kmutt.ac.th"
                pattern=".+@mail\.kmutt\.ac\.th"
                title="ใช้อีเมล @mail.kmutt.ac.th"
                required
              />
            </label>
            <label>
              รหัสผ่าน
              <input autoComplete="current-password" name="password" type="password" minLength={6} required />
            </label>
            <div className="form-meta">
              <span>เข้าสู่ระบบครั้งแรกจะสร้างบัญชีให้อัตโนมัติ (โหมดสาธิต)</span>
            </div>
            {error && <p className="login-message login-error" role="alert">{error}</p>}
            <button type="submit" className="primary-action" disabled={busy}>
              {busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'} <span aria-hidden="true">→</span>
            </button>
          </form>
          <div className="auth-divider"><span>หรือเข้าสู่ระบบด้วย</span></div>
          <div className="auth-options">
            {['Google', 'Microsoft', 'ModLink'].map((provider) => (
              <button
                key={provider}
                type="button"
                className="provider-button"
                onClick={() => setNotice(`การเข้าสู่ระบบด้วย ${provider} ยังไม่เปิดให้บริการ`)}
              >
                <span>{provider}</span>
              </button>
            ))}
          </div>
          {notice && <p className="login-message" role="status">{notice}</p>}
          <Link className="onboarding-link" to="/onboarding">ดูคำแนะนำการใช้งาน</Link>
        </div>
        <p className="auth-help">
          มีปัญหาในการเข้าสู่ระบบ? <a href="mailto:help@kmutt.ac.th">ติดต่อผู้ดูแลระบบ</a>
        </p>
      </section>
    </main>
  )
}
