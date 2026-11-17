// Sample data moved here from the old public/src/data/spaces.js.
export const spaces = [
  {
    id: 'library-1',
    name: 'ห้องอ่านหนังสือกลาง',
    type: 'nearby',
    building: 'อาคาร A',
    floor: 'ชั้น 2',
    distance: 120,
    capacity: 48,
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
    facilities: ['ปลั๊กไฟ', 'Wi-Fi', 'เครื่องปรับอากาศ'],
    rules: ['ใช้พื้นที่ตามช่วงเวลาที่จอง'],
  },
];

// Bookable seats per space. Sample values: edit these to match the real rooms.
export const seatLabels = {
  'library-1': ['ที่นั่ง A01', 'ที่นั่ง A02', 'ที่นั่ง A03', 'ที่นั่ง A04', 'ที่นั่ง A05', 'ที่นั่ง A06'],
  'meeting-1': ['ห้อง 1'],
  'workspace-1': ['ที่นั่ง B01', 'ที่นั่ง B02', 'ที่นั่ง B03', 'ที่นั่ง B04'],
};
