import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const STEPS = [
  { title: 'ค้นหาพื้นที่', body: 'ดูพื้นที่ใกล้คุณและความหนาแน่นแบบเรียลไทม์ กรองตามห้องสมุด Co-working หรือห้องประชุม' },
  { title: 'จองเวลา', body: 'เลือกวันและช่วงเวลา ห้องสมุดเลือกที่นั่งได้ 1 คนต่อ 1 ที่ ส่วนห้องประชุมต้องมีอย่างน้อย 3 คน' },
  { title: 'ชวนเพื่อนและเช็กอิน', body: 'ห้องประชุมจะได้ QR code ให้เพื่อนสแกนเข้าร่วม แล้วเช็กอินเมื่อถึงเวลา' },
]

export default function OnboardingPage() {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const step = STEPS[index]
  const last = index === STEPS.length - 1

  return (
    <main className="content onboarding">
      <p className="step">ขั้นที่ {index + 1} จาก {STEPS.length}</p>
      <h1>{step.title}</h1>
      <p>{step.body}</p>
      <button type="button" onClick={() => (last ? navigate('/login') : setIndex(index + 1))}>
        {last ? 'เริ่มต้นใช้งาน' : 'ถัดไป'}
      </button>
      <Link className="text-link" to="/login">ข้าม</Link>
    </main>
  )
}
