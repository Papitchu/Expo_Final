# Seatsense · เว็บจองพื้นที่อ่านหนังสือ KMUTT

เว็บสำหรับค้นหาและจองที่นั่งในห้องสมุด พื้นที่ Co-working และห้องประชุมภายในมหาวิทยาลัย
หน้าเว็บเขียนด้วย **React + Vite** ฝั่งเซิร์ฟเวอร์ใช้ **Node.js + Express** และเก็บข้อมูลใน **PostgreSQL**
ขั้นตอนติดตั้งแบบละเอียดและการนำขึ้น Vercel อยู่ใน [SETUP.md](SETUP.md)

## เริ่มใช้งานแบบเร็ว

ต้องมี Node.js 20.12 ขึ้นไป

```sh
npm run setup                 # ติดตั้งแพ็กเกจทั้งฝั่งเซิร์ฟเวอร์และ client
cp .env.example .env          # กรอก DATABASE_URL และ SESSION_SECRET
npm run db:setup              # สร้างตาราง + พื้นที่/ที่นั่งตัวอย่าง (รันซ้ำได้)
npm run dev                   # API :3000 + หน้าเว็บ http://localhost:5173
npm test                      # ทดสอบกฎการจอง (ไม่ต้องใช้ฐานข้อมูล)
```

ไม่มี PostgreSQL บนเครื่อง? เปิด `npm run db:local` ค้างไว้อีกหน้าต่าง (ฐานข้อมูล PGlite ในโฟลเดอร์ `.pglite/`)
แล้วใน `.env` ตั้ง `DATABASE_URL=postgres://postgres@127.0.0.1:5433/postgres` และ `PG_POOL_MAX=1`

ล็อกอินด้วยอีเมล `@mail.kmutt.ac.th` และรหัสผ่านอย่างน้อย 6 ตัวอักษร (ครั้งแรกจะสมัครให้อัตโนมัติ)

## ฟีเจอร์หลัก

- **ล็อกอินค้างไว้ 7 วัน** ด้วย session cookie (httpOnly) กลับมาเปิดเว็บจะเข้าหน้า Home ทันที
- **หน้าแรกแยกเป็นบล็อกตามอาคาร**: แต่ละอาคารแสดงความหนาแน่นรวม ระยะทาง และพื้นที่ทั้งหมดในอาคารนั้น
- **ความหนาแน่นแบบสด**: จำนวนผู้ใช้ในช่วงเวลาปัจจุบัน ÷ ความจุ แสดงสี เขียว (<50%) / เหลือง (50–80%) / แดง (≥80%) อัปเดตทุก 20 วินาที
- **พื้นที่ใกล้ที่สุด** จากตำแหน่ง GPS (`navigator.geolocation`) ถ้าไม่อนุญาตให้เลือกอาคารเอง
- **กรองตามประเภท**: ห้องสมุด / Co-working / ห้องประชุม และค้นหาด้วยชื่อ
- **กฎการจอง** (ตรวจที่เซิร์ฟเวอร์และฐานข้อมูล):
  | ประเภท | กฎ |
  |---|---|
  | ห้องสมุด | 1 คนต่อ 1 ที่นั่งต่อช่วงเวลา ต้องเลือกที่นั่ง |
  | Co-working | จองรายบุคคล ไม่เกินความจุ |
  | ห้องประชุม | จองทั้งห้อง ต้องมีอย่างน้อย 3 คน ผ่าน QR / ลิงก์เชิญที่หมดอายุใน 15 นาที |
- ผู้ใช้ 1 คนจองได้ 1 ที่ต่อช่วงเวลา ล่วงหน้าได้ 7 วัน ช่วงละ 1 ชั่วโมง (08:00–20:00 เวลาไทย)
- **รายการจองของฉัน**: เวลาที่จอง สถานะ เช็กอิน (ก่อนเริ่ม 10 นาทีถึงหมดช่วง) และยกเลิก

## โครงสร้างไฟล์

```text
client/                 หน้าเว็บ React (Vite) — build ออกไปที่ public/ ของโฟลเดอร์หลัก
  src/pages/            หน้าต่าง ๆ: Login, Onboarding, Home, SpaceDetail, Booking, MyBookings, BookingDetail, JoinGroup
  src/components/       BuildingBlock, SpaceCard, DensityBadge, CategoryFilter, NearestAlert, SlotPicker, QRInvite, ...
  src/context/          AuthContext (สถานะล็อกอิน)
  src/services/         เรียก API (auth, spaces, bookings)
  src/hooks/ utils/     usePolling, useGeolocation, density, distance, format
  src/styles/           CSS แยกตามส่วน
src/                    เซิร์ฟเวอร์ Express (ไม่ถูกเสิร์ฟให้เบราว์เซอร์)
  index.js              จุดเริ่ม (Vercel ใช้ไฟล์นี้)
  routes/               auth.js, spaces.js, bookings.js
  services/             rules.js (กฎการจอง), data.js (คำสั่ง SQL)
  env.js                โหลด .env และตรวจค่าที่จำเป็น
  db.js session.js dates.js http.js
scripts/                schema.sql, seed-data.js, setup-db.js, local-db.js
tests/                  rules.test.js (npm test)
public/                 ผลลัพธ์จาก npm run build (ไม่ commit)
vercel.json             ให้ทุกเส้นทางที่ไม่ใช่ /api เปิดแอป React
```

## API

ทุกเส้นทางยกเว้น `/api/auth/*` และ `/api/health` ต้องล็อกอินก่อน

| Method | Path | หน้าที่ |
|---|---|---|
| POST | `/api/auth/login` | เข้าสู่ระบบ / สมัครอัตโนมัติ `{ email, password }` |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/auth/me` | ผู้ใช้ปัจจุบัน (401 ถ้ายังไม่ล็อกอิน) |
| GET | `/api/spaces` | รายการพื้นที่ + `activeCount`, `density` |
| GET | `/api/spaces/:id` | รายละเอียดพื้นที่ |
| GET | `/api/spaces/:id/availability?date=YYYY-MM-DD` | ช่วงเวลาว่างรายวัน |
| GET | `/api/bookings` | การจองของฉัน |
| POST | `/api/bookings` | จอง `{ spaceId, date, slot, seatId? }` |
| GET | `/api/bookings/:id` | รายละเอียดการจอง |
| POST | `/api/bookings/:id/cancel` | ยกเลิก (เจ้าของเท่านั้น) |
| POST | `/api/bookings/:id/checkin` | เช็กอิน |
| GET | `/api/bookings/invite/:token` | ดูคำเชิญห้องประชุม |
| POST | `/api/bookings/join/:token` | เข้าร่วมกลุ่มห้องประชุม |

## ถ้าต้องการออกแบบ UX/UI และพัฒนาต่อเอง

1. **กำหนดงานของผู้ใช้ก่อน**: เขียนว่าใครเข้ามาใช้เว็บ ต้องการทำอะไร และต้องผ่านขั้นตอนใด เช่น ค้นหาพื้นที่ → เลือกเวลา → ยืนยันการจอง
2. **ร่าง wireframe**: วางลำดับข้อมูลและปุ่มของแต่ละหน้าก่อนเลือกสีหรือรายละเอียดตกแต่ง ใช้กระดาษ, Figma หรือเครื่องมือออกแบบที่ถนัด
3. **แก้เนื้อหาของหน้า**: เปิดไฟล์ใน `client/src/pages/` เช่น หน้า login → `LoginPage.jsx`, หน้าหลัก → `HomePage.jsx`
4. **ปรับหน้าตา**: CSS แยกตามส่วนใน `client/src/styles/` (สีปุ่มหลัก → `.primary-action` ใน `auth.css`, สีความหนาแน่น → `.density-*` ใน `spaces.css`)
5. **เพิ่มหรือแก้ข้อมูลพื้นที่**: แก้ `scripts/seed-data.js` แล้วรัน `npm run db:setup` (`library` ต้องมี `seats`, `coworking`/`meeting` ใช้ `capacity`, ห้องประชุมกำหนด `minGroupSize`)
6. **เปลี่ยนกฎการจอง**: แก้ `src/services/rules.js` (ฐานข้อมูลยังป้องกันการจองที่นั่งซ้ำด้วย unique index ใน `scripts/schema.sql`)
7. **เชื่อมระบบจริงภายหลัง**: เชื่อม Google/Microsoft/ModLink ผ่าน OAuth ที่มหาวิทยาลัยกำหนด แทนการล็อกอินโหมดสาธิต

## ข้อจำกัดตอนนี้

- ล็อกอินเป็นโหมดสาธิต: อีเมล KMUTT ใดก็ได้สมัครได้เอง ยังไม่มีการยืนยันอีเมล
- ปุ่ม Google / Microsoft / ModLink ยังไม่เชื่อมต่อ
- สถานะ "หมดเวลา" / "เสร็จสิ้น" อัปเดตเมื่อมีคนเรียก API (ไม่มี cron)
