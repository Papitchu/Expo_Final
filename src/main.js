const root = document.querySelector('#app');

import('./app.js')
  .then(({ createApp }) => createApp(root))
  .catch((error) => {
    console.error('Unable to load booking flow:', error);
    root.innerHTML = '<section style="max-width:560px;margin:12vh auto;padding:32px;font:16px system-ui;color:#17332d"><h1>โหลดหน้าเข้าสู่ระบบไม่สำเร็จ</h1><p>กรุณารีเฟรชหน้าเว็บ หากยังพบปัญหาให้ตรวจการเชื่อมต่อไฟล์ในโฟลเดอร์ src</p></section>';
  });
