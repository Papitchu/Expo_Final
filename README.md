# Seatsense · เว็บจองพื้นที่อ่านหนังสือ KMUTT

ค้นหาและจองพื้นที่อ่านหนังสือ (ห้องสมุด), Co-working และห้องประชุมภายในมหาวิทยาลัย
React (Vite) ฝั่งหน้าเว็บ + Node.js/Express ฝั่ง API เก็บข้อมูลเป็นไฟล์ JSON (โหมดสาธิต)

## เริ่มใช้งาน

```sh
npm run setup      # ติดตั้ง dependencies ทั้ง root, server, client
npm run dev        # API :4000 + เว็บ :5173 (Vite proxy /api → :4000)
```

เปิด `http://localhost:5173` แล้วเข้าสู่ระบบด้วยอีเมล `@mail.kmutt.ac.th` ใดก็ได้
(รหัสผ่านอย่างน้อย 6 ตัว) — ครั้งแรกจะสร้างบัญชีให้อัตโนมัติ ครั้งต่อไปต้องใช้รหัสเดิม

ตั้งค่า server ได้ใน `server/.env` (ดูตัวอย่างที่ `server/.env.example`): `JWT_SECRET`, `PORT`, `INVITE_TTL_MINUTES`, `DATA_DIR`

## ฟีเจอร์หลัก

- **เข้าสู่ระบบค้างไว้**: JWT 7 วันเก็บใน `localStorage` เปิดเว็บใหม่จะเข้าหน้าหลักทันที ลิงก์ที่ต้องล็อกอิน (เช่น QR เชิญ) จะพากลับมาหลังล็อกอิน
- **ความหนาแน่นสด**: ผู้ใช้ที่จองอยู่ในช่วงเวลาปัจจุบัน / ความจุ — เขียว < 50%, เหลือง 50–80%, แดง > 80% อัปเดตทุก 20 วินาที
- **พื้นที่ใกล้ฉัน**: ใช้ `navigator.geolocation` หาพื้นที่ว่างที่ใกล้ที่สุด ถ้าไม่ได้รับอนุญาตให้เลือกอาคารแทน
- **กฎตามประเภท** (ตรวจที่ server):
  - ห้องสมุด — 1 คนต่อ 1 ที่นั่ง ต้องเลือกที่นั่ง
  - Co-working — จองรายบุคคล รับได้ตามความจุ
  - ห้องประชุม — ต้องมี ≥ 3 คน: ผู้จองได้ QR/ลิงก์ชั่วคราว (15 นาที) ให้เพื่อนสแกนเข้าร่วม ครบแล้วยืนยันอัตโนมัติ ไม่ครบห้องจะถูกปล่อยคืน
  - ทุกประเภท: จองล่วงหน้าได้ 7 วัน, 1 คนจองได้ 1 ที่ต่อช่วงเวลา, เช็กอินได้ตั้งแต่ 10 นาทีก่อนเริ่ม
- **การจองของฉัน**: แยกกำลังจะมาถึง / ประวัติ พร้อมเวลาที่จองและสถานะ

> ทดสอบ QR ด้วยมือถือ: เปิดเว็บจากเครื่องอื่นในวง Wi-Fi เดียวกันผ่าน IP ที่ Vite แสดง (Network) แล้วสร้างการจองห้องประชุมจาก URL นั้น QR จะชี้ไปที่ IP เดียวกัน

## โครงสร้างไฟล์

```text
package.json                 สคริปต์รวม (setup / dev / build)
client/                      React + Vite
  src/
    App.jsx                  เส้นทาง (react-router) + AuthProvider
    context/                 AuthContext (token, user, login, logout)
    services/                เรียก API: api.js (fetch + Bearer), auth, spaces, bookings
    hooks/                   usePolling, useGeolocation
    utils/                   density (สีสถานะ), distance (Haversine), format (วันที่/ป้าย)
    components/              AppLayout, ProtectedRoute, SpaceCard, DensityBadge,
                             CategoryFilter, NearestAlert, SlotPicker, QRInvite, StatusBadge
    pages/                   Login, Onboarding, Home, SpaceDetail, Booking,
                             MyBookings, BookingDetail, JoinGroup
    styles/                  base, auth, layout, spaces, booking (.css)
server/                      Express API
  index.js                   ประกอบ routes + error handler
  middleware/auth.js         ตรวจ JWT
  routes/ → controllers/     auth, spaces, bookings
  services/
    rules.js                 กฎการจองแต่ละประเภท
    availability.js          ความหนาแน่น, ช่วงเวลาว่าง, อัปเดตสถานะตามเวลา
    store.js                 อ่าน/เขียนไฟล์ JSON
    time.js                  ช่วงเวลา 08:00–20:00 (ชั่วโมงละช่วง)
  data/spaces.json           ข้อมูลพื้นที่ (แก้ได้) — users.json/bookings.json สร้างตอนรัน
```

### API

| Method | Path | หน้าที่ |
|---|---|---|
| POST | `/api/auth/login` | เข้าสู่ระบบ / สมัครอัตโนมัติ → `{ token, user }` |
| GET | `/api/auth/me` | ตรวจ token |
| GET | `/api/spaces` | รายการพื้นที่ + `activeCount`, `density` |
| GET | `/api/spaces/:id/availability?date=` | ช่วงเวลาว่างรายวัน |
| GET | `/api/bookings/me` | การจองของฉัน |
| POST | `/api/bookings` | จอง `{ spaceId, date, slot, seatId? }` |
| PATCH | `/api/bookings/:id` | `{ action: 'cancel' \| 'checkin' }` |
| GET / POST | `/api/bookings/invite/:token`, `/api/bookings/join/:token` | ดู / เข้าร่วมกลุ่มห้องประชุม |

## ถ้าต้องการออกแบบ UX/UI และพัฒนาต่อเอง

1. **กำหนดงานของผู้ใช้ก่อน**: เขียนว่าใครเข้ามาใช้เว็บ ต้องการทำอะไร และต้องผ่านขั้นตอนใด เช่น ค้นหาพื้นที่ → เลือกเวลา → ยืนยันการจอง
2. **ร่าง wireframe**: วางลำดับข้อมูลและปุ่มของแต่ละหน้าก่อนเลือกสีหรือรายละเอียดตกแต่ง ใช้กระดาษ, Figma หรือเครื่องมือออกแบบที่ถนัด
3. **แก้เนื้อหาของหน้า**: เปิดไฟล์ใน `client/src/pages/` เช่น หน้า login → `LoginPage.jsx`, หน้าหลัก → `HomePage.jsx`
4. **ปรับหน้าตา**: CSS แยกตามส่วนใน `client/src/styles/` (สีปุ่มหลัก → `.primary-action` ใน `auth.css`, สีความหนาแน่น → `.density-*` ใน `spaces.css`)
5. **เพิ่มหรือแก้ข้อมูลพื้นที่**: แก้ `server/data/spaces.json` (`category`: `library` ต้องมี `seats`, `coworking`/`meeting` ใช้ `capacity`, ห้องประชุมกำหนด `minGroupSize`)
6. **เปลี่ยนกฎการจอง**: แก้ `server/services/rules.js`
7. **เชื่อมระบบจริงภายหลัง**: เปลี่ยน `store.js` เป็นฐานข้อมูล และเชื่อม Google/Microsoft/ModLink ผ่าน OAuth ที่มหาวิทยาลัยกำหนดแทนการล็อกอินโหมดสาธิต
