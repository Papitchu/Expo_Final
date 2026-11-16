import { button, escapeHtml } from '../ui/markup.js';

export function renderMyBookings(state) {
  const cards = state.bookings.map((booking) => `<article class="record">
    <h3>${escapeHtml(booking.space?.name || '')}</h3>
    <p>${escapeHtml(booking.date)} · ${escapeHtml(booking.time)} · ${escapeHtml(booking.status)}</p>
    ${button('รายละเอียด', `booking:${booking.id}`, true)}</article>`).join('');
  return `<h1>รายการจองของฉัน</h1><div class="records">${cards || '<p>ยังไม่มีรายการจอง</p>'}</div>${button('ค้นหาพื้นที่', 'home', true)}`;
}

export function renderBookingDetail(state) {
  const booking = state.booking;
  return `<h1>รายละเอียดการจอง</h1><p>${escapeHtml(booking?.space?.name || '')}</p>
    <p>${escapeHtml(booking?.date || '')} · ${escapeHtml(booking?.time || '')} · ${escapeHtml(booking?.seat || '')}</p>
    <p>สถานะ: ${escapeHtml(booking?.status || '')}</p>
    <p>จัดการรายการจอง</p>
    ${button('เช็กอิน', 'checkin')}${button('ขยายเวลา', 'extend', true)}${button('เปลี่ยนแปลง', 'schedule', true)}${button('ยกเลิกการจอง', 'cancel', true)}
    <p>${escapeHtml(booking?.message || '')}</p>${button('กลับรายการจอง', 'my-bookings', true)}`;
}
