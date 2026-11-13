export const spaceTypes = [
  { id: 'nearby', label: 'พื้นที่อ่านหนังสือใกล้ฉัน' },
  { id: 'meeting', label: 'ห้องประชุม' },
  { id: 'working', label: 'พื้นที่ทำงาน' },
];

export const spaces = [
  {
    id: 'library-1',
    name: 'ห้องอ่านหนังสือกลาง',
    type: 'nearby',
    building: 'อาคาร A',
    floor: 'ชั้น 2',
    distance: 120,
    capacity: 48,
    available: true,
    facilities: ['ปลั๊กไฟ', 'Wi-Fi', 'เครื่องปรับอากาศ'],
    rules: ['งดใช้เสียง', 'นำอาหารเข้าพื้นที่ไม่ได้'],
  },
  {
    id: 'meeting-1',
    name: 'ห้องประชุมกลุ่ม 1',
    type: 'meeting',
    building: 'อาคาร B',
    floor: 'ชั้น 3',
    distance: 350,
    capacity: 8,
    available: true,
    facilities: ['จอแสดงผล', 'ไวท์บอร์ด', 'ปลั๊กไฟ'],
    rules: ['จองได้ครั้งละไม่เกิน 2 ชั่วโมง'],
  },
  {
    id: 'workspace-1',
    name: 'โซนทำงานร่วมกัน',
    type: 'working',
    building: 'อาคาร C',
    floor: 'ชั้น 1',
    distance: 520,
    capacity: 24,
    available: false,
    facilities: ['ปลั๊กไฟ', 'Wi-Fi', 'เครื่องปรับอากาศ'],
    rules: ['ใช้พื้นที่ตามช่วงเวลาที่จอง'],
  },
];
