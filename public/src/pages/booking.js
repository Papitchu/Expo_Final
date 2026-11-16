import { button, escapeHtml } from '../ui/markup.js';

export function renderSchedule(state) {
  return `<h1>เลือกวัน เวลา และที่นั่ง / ห้อง</h1><form data-form="schedule">
    <label>วันที่ <input type="date" name="date" required value="${escapeHtml(state.date)}" /></label>
    <label>ช่วงเวลา <select name="time" required><option value="">เลือกช่วงเวลา</option><option>09:00–10:00</option><option>10:00–11:00</option><option>13:00–14:00</option><option>14:00–15:00</option></select></label>
    <label>ที่นั่งหรือห้อง <select name="seat" required><option value="">เลือกที่นั่ง / ห้อง</option><option>ที่นั่ง A01</option><option>ที่นั่ง A02</option><option>ห้อง 1</option></select></label>
    <button>ตรวจสอบช่วงเวลาว่าง</button></form>`;
}

export function renderAlternatives() {
  return `<h1>ช่วงเวลานี้ไม่ว่าง</h1><p>เลือกช่วงเวลาอื่นหรือดูพื้นที่คล้ายกัน</p>
    <ul><li>เวลาอื่น: 10:00–11:00</li><li>พื้นที่ใกล้เคียง: ห้องอ่านหนังสือกลาง</li></ul>
    ${button('เลือกเวลาอื่น', 'schedule')}${button('ดูพื้นที่ทั้งหมด', 'all-spaces', true)}`;
}

export function renderBookingReview(state) {
  return `<h1>ตรวจสอบการจองและเพิ่มผู้ร่วมใช้</h1><dl>
    <dt>พื้นที่</dt><dd>${escapeHtml(state.space?.name || '')}</dd>
    <dt>วันที่และเวลา</dt><dd>${escapeHtml(state.date)} · ${escapeHtml(state.time)}</dd>
    <dt>ที่นั่ง / ห้อง</dt><dd>${escapeHtml(state.seat)}</dd></dl>
    <form data-form="attendees"><label>ผู้ร่วมใช้ (รหัสมหาวิทยาลัย, คั่นด้วยจุลภาค)<input name="attendees" value="${escapeHtml(state.attendees)}" /></label><button>ยืนยันการจอง</button></form>
    ${button('แก้ไขวันและเวลา', 'schedule', true)}`;
}

export function renderBookingConfirmed(state) {
  return `<h1>ยืนยันการจองสำเร็จ</h1><p>รหัสการจอง: ${escapeHtml(state.booking?.id || '')}</p>
    <section class="placeholder">QR code สำหรับเช็กอิน (ตัวอย่าง)</section>
    <p>${escapeHtml(state.booking?.space?.name || '')} · ${escapeHtml(state.booking?.date || '')} · ${escapeHtml(state.booking?.time || '')}</p>
    ${button('ไปยังรายการจองของฉัน', 'my-bookings')}`;
}
