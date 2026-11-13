import { escapeHtml } from '../ui/markup.js';

export function renderLogin(state) {
  return `<p class="eyebrow">ยินดีต้อนรับกลับ</p><h1>เข้าสู่ระบบ</h1><p class="login-intro">ใช้บัญชี KMUTT เพื่อค้นหาและจองพื้นที่ของคุณ</p>
    <form data-form="login">
      <label>อีเมลมหาวิทยาลัย<input name="email" type="email" placeholder="name@mail.kmutt.ac.th" autocomplete="username" required pattern=".+@mail\\.kmutt\\.ac\\.th" /></label>
      <label>รหัสผ่าน<input name="password" type="password" autocomplete="current-password" required /></label>
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
}
