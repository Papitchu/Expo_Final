export default function AlternativesPage({ onTryAgain, onAllSpaces }) {
  return (
    <section>
      <h1>ช่วงเวลานี้ไม่ว่าง</h1>
      <p>เลือกช่วงเวลาอื่นหรือสถานที่อื่น</p>
      <ul>
        <li>เวลาอื่น: 10:00–11:00 (ตัวอย่าง)</li>
        <li>พื้นที่ใกล้เคียง: ห้องอ่านหนังสือกลาง</li>
      </ul>
      <button type="button" onClick={onTryAgain}>เลือกเวลาอื่น</button>
      <button className="secondary" type="button" onClick={onAllSpaces}>ดูพื้นที่ทั้งหมด</button>
    </section>
  )
}
