import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'

function useCountdown(iso) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const ms = Math.max(new Date(iso).getTime() - now, 0)
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`
}

/** Temporary QR + link for a pending meeting-room booking. */
export default function QRInvite({ booking }) {
  const [copied, setCopied] = useState(false)
  const remaining = useCountdown(booking.inviteExpiresAt)
  const url = `${window.location.origin}/join/${booking.inviteToken}`
  const needed = booking.space?.minGroupSize ?? 3

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="qr-invite">
      <div className="qr-code">
        <QRCodeSVG value={url} size={176} marginSize={2} />
      </div>
      <div>
        <h2>ชวนเพื่อนสแกนเพื่อเข้าร่วม</h2>
        <p>
          ต้องมีสมาชิกอย่างน้อย {needed} คน ตอนนี้มี <strong>{booking.participants.length}/{needed}</strong> คน
        </p>
        <p className="qr-expiry">QR หมดอายุใน <strong>{remaining}</strong> นาที — หากไม่ครบ ห้องจะถูกปล่อยคืน</p>
        <input className="qr-url" readOnly value={url} aria-label="ลิงก์เชิญ" onFocus={(e) => e.target.select()} />
        <button type="button" className="secondary" onClick={copyLink}>
          {copied ? 'คัดลอกแล้ว ✓' : 'คัดลอกลิงก์'}
        </button>
      </div>
    </section>
  )
}
