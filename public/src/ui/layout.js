import { escapeHtml, button } from './markup.js';

const screenTitles = {
  onboarding: 'แนะนำการใช้งาน',
  login: 'เข้าสู่ระบบ',
  home: 'หน้าหลัก',
  search: 'ค้นหาพื้นที่',
  'space-list': 'รายการพื้นที่',
  'space-detail': 'รายละเอียดพื้นที่',
  schedule: 'เลือกวัน เวลา และที่นั่ง',
  alternatives: 'ช่วงเวลาหรือพื้นที่ใกล้เคียง',
  'booking-review': 'ตรวจสอบการจอง',
  'booking-confirmed': 'จองสำเร็จ',
  'my-bookings': 'รายการจองของฉัน',
  'booking-detail': 'รายละเอียดการจอง',
};

export function renderFrame(screen, content) {
  if (screen === 'login') return renderAuthLayout(content);
  return `<div class="app-shell"><header class="app-header">
    <a class="app-brand" href="#" data-action="home"><span class="brand-mark">S</span><span>seat<span class="brand-dot">.</span>kmutt</span></a>
    <nav>${button('ค้นหาพื้นที่', 'home', true)} ${button('รายการจอง', 'my-bookings', true)}</nav>
  </header>
  <section class="content"><p class="step">ขั้นตอน: ${escapeHtml(screenTitles[screen] || 'พื้นที่จอง')}</p>${content}</section>
  <footer>พื้นที่สำหรับอ่านหนังสือและทำงาน · KMUTT</footer></div>`;
}

function renderAuthLayout(content) {
  return `<main class="auth-page">
    <section class="auth-visual" aria-label="แนะนำบริการ">
      <div class="auth-brand"><span class="brand-mark">S</span><span>seat<span class="brand-dot">.</span>kmutt</span></div>
      <div class="visual-copy"><p class="eyebrow">พื้นที่ของคุณ เวลาเพื่อการโฟกัส</p><h1>หาที่นั่งที่ใช่<br>แล้วเริ่มทำสิ่งสำคัญ</h1><p>ค้นหาและจองพื้นที่อ่านหนังสือ ห้องประชุม และพื้นที่ทำงานภายในมหาวิทยาลัย</p>
        <div class="visual-points"><span><b>01</b> ค้นหาพื้นที่ใกล้ตัว</span><span><b>02</b> เลือกเวลาและที่นั่ง</span><span><b>03</b> เช็กอินด้วย QR code</span></div></div>
      <div class="visual-art" aria-hidden="true"><div class="art-window"><div class="art-top"><i></i><i></i><i></i><span>STUDY SPACE</span></div><div class="art-room"><div class="art-sun"></div><div class="art-shelf"></div><div class="art-desk"><div class="art-laptop"></div><div class="art-chair"></div></div><div class="art-plant">✳</div></div></div><span class="art-tag">โฟกัสได้เต็มที่</span></div>
      <p class="visual-footer">สำหรับนักศึกษาและบุคลากร KMUTT</p>
    </section>
    <section class="auth-side"><div class="auth-mobile-brand"><span class="brand-mark">S</span><span>seat<span class="brand-dot">.</span>kmutt</span></div><div class="login-card">${content}</div><p class="auth-help">มีปัญหาในการเข้าสู่ระบบ? <a href="mailto:help@kmutt.ac.th">ติดต่อผู้ดูแลระบบ</a></p></section>
  </main>`;
}
