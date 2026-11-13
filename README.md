# เว็บจองพื้นที่อ่านหนังสือ KMUTT

เว็บตัวอย่างตาม user flow สำหรับค้นหาและจองพื้นที่ในมหาวิทยาลัย ปัจจุบันใช้ข้อมูลจำลองในเบราว์เซอร์ ยังไม่ได้เชื่อมระบบยืนยันตัวตนหรือ backend

## เปิดเว็บ

เปิด static server ที่ root ของโปรเจกต์:

```sh
python3 -m http.server 8000
```

แล้วเข้า `http://localhost:8000`

## โครงสร้างไฟล์

```text
index.html                 จุดเริ่มต้นของเว็บ
src/
  main.js                  โหลดแอปและแสดงข้อผิดพลาดตอนเริ่มต้น
  app.js                   ประกอบ state, event handlers และ screen renderer
  app/
    state.js               state เริ่มต้นของเว็บ
    actions.js             การตอบสนองต่อคลิกและการส่งฟอร์ม
    screens.js             จับคู่ชื่อ screen กับ page module
  pages/
    login.js               หน้าเข้าสู่ระบบ
    onboarding.js          หน้าแนะนำการใช้งาน
    spaces.js              หน้าหลัก ค้นหา รายการ และรายละเอียดพื้นที่
    booking.js             เลือกเวลา ตรวจสอบ และยืนยันการจอง
    myBookings.js          รายการจองและรายละเอียดการจอง
  data/
    flow.js                ขั้นตอน onboarding และ user flow
    spaces.js              ประเภทพื้นที่และข้อมูลจำลอง
  ui/
    layout.js              กรอบหน้าเว็บและ navigation
    markup.js              helper สำหรับ HTML และปุ่ม
  styles.css               design tokens, layout และ responsive styles
```

## ถ้าต้องการออกแบบ UX/UI และพัฒนาต่อเอง

1. **กำหนดงานของผู้ใช้ก่อน**: เขียนว่าใครเข้ามาใช้เว็บ ต้องการทำอะไร และต้องผ่านขั้นตอนใด เช่น ค้นหาพื้นที่ → เลือกเวลา → ยืนยันการจอง
2. **ร่าง wireframe**: วางลำดับข้อมูลและปุ่มของแต่ละหน้าก่อนเลือกสีหรือรายละเอียดตกแต่ง ใช้กระดาษ, Figma หรือเครื่องมือออกแบบที่ถนัด
3. **แก้เนื้อหาของหน้า**: เปิดไฟล์ใน `src/pages/` ที่ตรงกับหน้าที่ต้องการ เช่น ปรับหน้า login ใน `src/pages/login.js` หรือหน้าค้นหาใน `src/pages/spaces.js`
4. **ปรับหน้าตา**: ใช้ class ที่มีอยู่แล้วหรือเพิ่ม class ใน page module จากนั้นเขียน CSS ใน `src/styles.css` แนะนำให้จัดสี ระยะห่าง ตัวอักษร และ responsive rules ไว้เป็นกลุ่มเดียวกัน
5. **เพิ่มหรือแก้ข้อมูลตัวอย่าง**: แก้ประเภทพื้นที่และข้อมูลสถานที่ใน `src/data/spaces.js` ส่วนลำดับ onboarding อยู่ใน `src/data/flow.js`
6. **เพิ่มพฤติกรรม**: แก้ state เริ่มต้นใน `src/app/state.js`, การกดปุ่มและส่งฟอร์มใน `src/app/actions.js`, และเพิ่มการจับคู่หน้าใน `src/app/screens.js`
7. **เชื่อมระบบจริงภายหลัง**: แทนที่ข้อมูลจำลองด้วย API และเชื่อม Google/Microsoft/ModLink ผ่านระบบ OAuth ที่มหาวิทยาลัยกำหนด โดยไม่เก็บรหัสผ่านไว้ในหน้าเว็บ

ตัวอย่างการไล่แก้: เปลี่ยนข้อความปุ่มล็อกอิน → `src/pages/login.js`; เปลี่ยนสีปุ่มหลัก → `.primary-action` ใน `src/styles.css`; เพิ่มหน้าจองใหม่ → เพิ่ม page module แล้วลงทะเบียนใน `src/app/screens.js` และเพิ่ม action ที่เกี่ยวข้องใน `src/app/actions.js`
