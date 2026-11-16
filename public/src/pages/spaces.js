import { spaceTypes, spaces } from '../data/spaces.js';
import { button, escapeHtml } from '../ui/markup.js';

export function renderHome(state) {
  return `<h1>ค้นหาที่อ่านหนังสือ</h1><form data-form="search">
    <label>ชื่อพื้นที่ อาคาร หรือสิ่งอำนวยความสะดวก <input name="query" value="${escapeHtml(state.query)}" /></label>
    <button>ค้นหา</button></form><h2>เลือกประเภทพื้นที่</h2><div class="records">
    ${spaceTypes.map((type) => `<article class="record"><h3>${escapeHtml(type.label)}</h3>${button('ดูพื้นที่', `type:${type.id}`, true)}</article>`).join('')}
    </div>${button('ดูรายการทั้งหมด', 'all-spaces', true)}`;
}

export function renderSpaceList(state) {
  const results = spaces
    .filter((space) => (!state.type || space.type === state.type)
      && (!state.query || `${space.name} ${space.building} ${space.facilities.join(' ')}`.toLowerCase().includes(state.query.toLowerCase())))
    .sort((a, b) => a.distance - b.distance);

  return `<h1>พื้นที่เรียงตามระยะทาง</h1><p>ตัวกรอง: วันที่ / เวลา / ความจุ / ประเภท (ตัวอย่าง)</p>
    <p>พบ ${results.length} พื้นที่ แสดงสถานะว่างและความจุ</p>
    <div class="records">${results.length ? results.map(renderSpaceCard).join('') : '<p>ไม่พบพื้นที่ตามเงื่อนไข</p>'}</div>
    ${button('กลับหน้าหลัก', 'home', true)}`;
}

export function renderSpaceDetail(state) {
  const space = state.space;
  return `<h1>${escapeHtml(space?.name || 'รายละเอียดพื้นที่')}</h1>
    <p>${escapeHtml(space?.building || '')} · ${escapeHtml(space?.floor || '')} · ความจุ ${space?.capacity || 0} คน</p>
    <h2>สิ่งอำนวยความสะดวก</h2><p>${(space?.facilities || []).map(escapeHtml).join(' · ')}</p>
    <h2>กฎการใช้พื้นที่</h2><ul>${(space?.rules || []).map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}</ul>
    <section class="placeholder">พื้นที่สำหรับรูปภาพและแผนผังชั้น</section>
    ${button('เลือกวันและเวลาจอง', 'schedule')}`;
}

function renderSpaceCard(space) {
  return `<article class="record"><h3>${escapeHtml(space.name)}</h3>
    <p>${escapeHtml(space.building)} · ${escapeHtml(space.floor)} · ${space.distance} ม.</p>
    <p>ความจุ ${space.capacity} คน · ${space.available ? 'มีช่วงเวลาว่าง' : 'เต็มในช่วงเวลานี้'}</p>
    ${button('ดูรายละเอียด', `space:${space.id}`, true)}</article>`;
}
