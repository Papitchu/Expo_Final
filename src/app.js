import { flow } from './data/flow.js';
import { spaceTypes, spaces } from './data/spaces.js';

const steps = {
  onboarding: 'แนะนำการใช้งาน', login: 'เข้าสู่ระบบ', home: 'หน้าหลัก',
  search: 'ค้นหาพื้นที่', 'space-list': 'รายการพื้นที่', 'space-detail': 'รายละเอียดพื้นที่',
  schedule: 'เลือกวัน เวลา และที่นั่ง', alternatives: 'ช่วงเวลาหรือพื้นที่ใกล้เคียง',
  'booking-review': 'ตรวจสอบการจอง', 'booking-confirmed': 'จองสำเร็จ',
  'my-bookings': 'รายการจองของฉัน', 'booking-detail': 'รายละเอียดการจอง',
};

export function createApp(root) {
  const state = {
    screen: 'login', onboardingIndex: 0, query: '', type: '', date: '', time: '',
    seat: '', attendees: '', space: null, bookings: [], booking: null,
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char]);

  function go(screen) {
    state.screen = screen;
    render();
  }

  function button(label, action, secondary = false) {
    return `<button type="button" data-action="${action}" class="${secondary ? 'secondary' : ''}">${label}</button>`;
  }

  function spaceCard(space) {
    return `<article class="record">
      <h3>${escapeHtml(space.name)}</h3>
      <p>${escapeHtml(space.building)} · ${escapeHtml(space.floor)} · ${space.distance} ม.</p>
      <p>ความจุ ${space.capacity} คน · ${space.available ? 'มีช่วงเวลาว่าง' : 'เต็มในช่วงเวลานี้'}</p>
      ${button('ดูรายละเอียด', `space:${space.id}`, true)}
    </article>`;
  }

  function frame(content) {
    if (state.screen === 'login') {
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
    return `<div class="app-shell"><header class="app-header"><a class="app-brand" href="#" data-action="home"><span class="brand-mark">S</span><span>seat<span class="brand-dot">.</span>kmutt</span></a><nav>
      ${button('ค้นหาพื้นที่', 'home', true)} ${button('รายการจอง', 'my-bookings', true)}
    </nav></header>
    <section class="content"><p class="step">ขั้นตอน: ${escapeHtml(steps[state.screen])}</p>${content}</section>
    <footer>พื้นที่สำหรับอ่านหนังสือและทำงาน · KMUTT</footer></div>`;
  }

  function render() {
    let content = '';
    switch (state.screen) {
      case 'onboarding': {
        const item = flow.onboarding[state.onboardingIndex];
        content = `<h1>ยินดีต้อนรับ</h1><p>ขั้นแนะนำ ${state.onboardingIndex + 1} จาก ${flow.onboarding.length}: ${item}</p>
          ${button(state.onboardingIndex === flow.onboarding.length - 1 ? 'เริ่มต้นใช้งาน' : 'ถัดไป', 'onboarding-next')}
          ${button('ข้าม', 'login', true)}`;
        break;
      }
      case 'login':
        content = `<p class="eyebrow">ยินดีต้อนรับกลับ</p><h1>เข้าสู่ระบบ</h1><p class="login-intro">ใช้บัญชี KMUTT เพื่อค้นหาและจองพื้นที่ของคุณ</p>
          <form data-form="login">
            <label>อีเมลมหาวิทยาลัย
              <input name="email" type="email" placeholder="name@mail.kmutt.ac.th" autocomplete="username" required pattern=".+@mail\\.kmutt\\.ac\\.th" />
            </label>
            <label>รหัสผ่าน
              <input name="password" type="password" autocomplete="current-password" required />
            </label>
            <div class="form-meta"><span>ใช้บัญชี KMUTT ของคุณ</span><a href="mailto:help@kmutt.ac.th">ลืมรหัสผ่าน?</a></div>
            <button class="primary-action">เข้าสู่ระบบ <span aria-hidden="true">→</span></button>
          </form>
          <div class="auth-divider"><span>หรือเข้าสู่ระบบด้วย</span></div>
          <div class="auth-options">
            <button type="button" data-action="auth:google" class="provider-button"><span class="provider-icon google-icon">G</span><span>Google</span></button>
            <button type="button" data-action="auth:microsoft" class="provider-button"><span class="provider-icon microsoft-icon"><i></i><i></i><i></i><i></i></span><span>Microsoft</span></button>
            <button type="button" data-action="auth:modlink" class="provider-button"><span class="provider-icon modlink-icon">M</span><span>ModLink</span></button>
          </div>
          <p class="login-note">การเข้าสู่ระบบด้วยผู้ให้บริการจะเปิดใช้งานเมื่อเชื่อมต่อระบบจริง</p>
          ${state.loginMessage ? `<p role="status">${escapeHtml(state.loginMessage)}</p>` : ''}`;
        break;
      case 'home':
        content = `<h1>ค้นหาที่อ่านหนังสือ</h1><form data-form="search">
          <label>ชื่อพื้นที่ อาคาร หรือสิ่งอำนวยความสะดวก <input name="query" value="${escapeHtml(state.query)}" /></label>
          <button>ค้นหา</button></form><h2>เลือกประเภทพื้นที่</h2><div class="records">
          ${spaceTypes.map((type) => `<article class="record"><h3>${type.label}</h3>${button('ดูพื้นที่', `type:${type.id}`, true)}</article>`).join('')}
          </div>${button('ดูรายการทั้งหมด', 'all-spaces', true)}`;
        break;
      case 'search':
      case 'space-list': {
        const results = spaces.filter((space) => (!state.type || space.type === state.type)
          && (!state.query || `${space.name} ${space.building} ${space.facilities.join(' ')}`.toLowerCase().includes(state.query.toLowerCase())))
          .sort((a, b) => a.distance - b.distance);
        content = `<h1>พื้นที่เรียงตามระยะทาง</h1><p>ตัวกรอง: วันที่ / เวลา / ความจุ / ประเภท (ตัวอย่าง)</p>
          <p>พบ ${results.length} พื้นที่ แสดงสถานะว่างและความจุ</p><div class="records">${results.length ? results.map(spaceCard).join('') : '<p>ไม่พบพื้นที่ตามเงื่อนไข</p>'}</div>
          ${button('กลับหน้าหลัก', 'home', true)}`;
        break;
      }
      case 'space-detail': {
        const space = state.space;
        content = `<h1>${escapeHtml(space?.name || 'รายละเอียดพื้นที่')}</h1>
          <p>${escapeHtml(space?.building || '')} · ${escapeHtml(space?.floor || '')} · ความจุ ${space?.capacity || 0} คน</p>
          <h2>สิ่งอำนวยความสะดวก</h2><p>${(space?.facilities || []).map(escapeHtml).join(' · ')}</p>
          <h2>กฎการใช้พื้นที่</h2><ul>${(space?.rules || []).map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}</ul>
          <section class="placeholder">พื้นที่สำหรับรูปภาพและแผนผังชั้น (ยังไม่ออกแบบ UI)</section>
          ${button('เลือกวันและเวลาจอง', 'schedule')}`;
        break;
      }
      case 'schedule':
        content = `<h1>เลือกวัน เวลา และที่นั่ง / ห้อง</h1><form data-form="schedule">
          <label>วันที่ <input type="date" name="date" required value="${escapeHtml(state.date)}" /></label>
          <label>ช่วงเวลา <select name="time" required><option value="">เลือกช่วงเวลา</option><option>09:00–10:00</option><option>10:00–11:00</option><option>13:00–14:00</option><option>14:00–15:00</option></select></label>
          <label>ที่นั่งหรือห้อง <select name="seat" required><option value="">เลือกที่นั่ง / ห้อง</option><option>ที่นั่ง A01</option><option>ที่นั่ง A02</option><option>ห้อง 1</option></select></label>
          <button>ตรวจสอบช่วงเวลาว่าง</button></form>`;
        break;
      case 'alternatives':
        content = `<h1>ช่วงเวลานี้ไม่ว่าง</h1><p>เลือกช่วงเวลาอื่นหรือดูพื้นที่คล้ายกัน</p>
          <ul><li>เวลาอื่น: 10:00–11:00</li><li>พื้นที่ใกล้เคียง: ห้องอ่านหนังสือกลาง</li></ul>
          ${button('เลือกเวลาอื่น', 'schedule')}${button('ดูพื้นที่ทั้งหมด', 'all-spaces', true)}`;
        break;
      case 'booking-review':
        content = `<h1>ตรวจสอบการจองและเพิ่มผู้ร่วมใช้</h1><dl>
          <dt>พื้นที่</dt><dd>${escapeHtml(state.space?.name || '')}</dd>
          <dt>วันที่และเวลา</dt><dd>${escapeHtml(state.date)} · ${escapeHtml(state.time)}</dd>
          <dt>ที่นั่ง / ห้อง</dt><dd>${escapeHtml(state.seat)}</dd></dl>
          <form data-form="attendees"><label>ผู้ร่วมใช้ (รหัสมหาวิทยาลัย, คั่นด้วยจุลภาค)<input name="attendees" value="${escapeHtml(state.attendees)}" /></label><button>ยืนยันการจอง</button></form>
          ${button('แก้ไขวันและเวลา', 'schedule', true)}`;
        break;
      case 'booking-confirmed':
        content = `<h1>ยืนยันการจองสำเร็จ</h1><p>รหัสการจอง: ${escapeHtml(state.booking?.id || '')}</p>
          <section class="placeholder">QR code สำหรับเช็กอิน (พื้นที่ตัวอย่าง)</section>
          <p>${escapeHtml(state.booking?.space?.name || '')} · ${escapeHtml(state.booking?.date || '')} · ${escapeHtml(state.booking?.time || '')}</p>
          ${button('ไปยังรายการจองของฉัน', 'my-bookings')}`;
        break;
      case 'my-bookings':
        content = `<h1>รายการจองของฉัน</h1><div class="records">${state.bookings.length ? state.bookings.map((booking) => `<article class="record"><h3>${escapeHtml(booking.space?.name || '')}</h3><p>${escapeHtml(booking.date)} · ${escapeHtml(booking.time)} · ${escapeHtml(booking.status)}</p>${button('รายละเอียด', `booking:${booking.id}`, true)}</article>`).join('') : '<p>ยังไม่มีรายการจอง</p>'}</div>${button('ค้นหาพื้นที่', 'home', true)}`;
        break;
      case 'booking-detail':
        content = `<h1>รายละเอียดการจอง</h1><p>${escapeHtml(state.booking?.space?.name || '')}</p>
          <p>${escapeHtml(state.booking?.date || '')} · ${escapeHtml(state.booking?.time || '')} · ${escapeHtml(state.booking?.seat || '')}</p>
          <p>จัดการ: เช็กอิน / ขยายเวลา / เปลี่ยนแปลง / ยกเลิก (ตัวอย่าง)</p>
          ${button('เช็กอิน', 'checkin')}${button('ขยายเวลา', 'extend', true)}${button('เปลี่ยนแปลง', 'schedule', true)}${button('ยกเลิกการจอง', 'cancel', true)}
          <p>${escapeHtml(state.booking?.message || '')}</p>${button('กลับรายการจอง', 'my-bookings', true)}`;
        break;
      default: content = `<h1>ไม่พบขั้นตอน</h1>${button('กลับหน้าหลัก', 'home')}`;
    }
    root.innerHTML = frame(content);
  }

  root.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    if (action === 'onboarding-next') {
      state.onboardingIndex += 1;
      if (state.onboardingIndex >= flow.onboarding.length) return go('login');
      return render();
    }
    if (action === 'all-spaces') { state.type = ''; return go('space-list'); }
    if (action.startsWith('auth:')) {
      state.authProvider = action.slice(5);
      state.loginMessage = `เลือกเข้าสู่ระบบด้วย ${state.authProvider} แล้ว (ยังไม่ได้เชื่อมระบบ)`;
      render();
      return;
    }
    if (action.startsWith('type:')) { state.type = action.slice(5); return go('space-list'); }
    if (action.startsWith('space:')) { state.space = spaces.find((space) => space.id === action.slice(6)); return go('space-detail'); }
    if (action.startsWith('booking:')) { state.booking = state.bookings.find((booking) => booking.id === action.slice(8)); return go('booking-detail'); }
    if (action === 'checkin' || action === 'extend' || action === 'cancel') {
      if (action === 'cancel' && state.booking) state.booking.status = 'ยกเลิกแล้ว';
      if (state.booking) state.booking.message = action === 'checkin' ? 'เช็กอินแล้ว (ตัวอย่าง)' : action === 'extend' ? 'ส่งคำขอขยายเวลาแล้ว (ตัวอย่าง)' : 'ยกเลิกรายการแล้ว';
      return render();
    }
    go(action);
  });

  root.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    if (event.target.dataset.form === 'login') {
      const email = data.get('email')?.trim() || '';
      state.userEmail = email;
      return go('home');
    }
    if (event.target.dataset.form === 'search') {
      state.query = data.get('query')?.trim() || '';
      state.type = '';
      return go('search');
    }
    if (event.target.dataset.form === 'schedule') {
      state.date = data.get('date'); state.time = data.get('time'); state.seat = data.get('seat');
      if (state.space?.available === false) return go('alternatives');
      return go('booking-review');
    }
    if (event.target.dataset.form === 'attendees') {
      state.attendees = data.get('attendees')?.trim() || '';
      state.booking = {
        id: `BK-${Date.now().toString().slice(-6)}`, space: state.space,
        date: state.date, time: state.time, seat: state.seat,
        attendees: state.attendees, status: 'ยืนยันแล้ว',
      };
      state.bookings.unshift(state.booking);
      return go('booking-confirmed');
    }
  });

  render();
}
