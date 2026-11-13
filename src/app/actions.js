import { spaces } from '../data/spaces.js';
import { flow } from '../data/flow.js';

export function handleAction(action, state, navigate, render) {
  if (action === 'onboarding-next') {
    state.onboardingIndex += 1;
    if (state.onboardingIndex >= flow.onboarding.length) return navigate('login');
    return render();
  }

  if (action === 'all-spaces') {
    state.type = '';
    return navigate('space-list');
  }

  if (action.startsWith('auth:')) {
    const provider = action.slice(5);
    state.loginMessage = `เลือกเข้าสู่ระบบด้วย ${provider} แล้ว (ยังไม่ได้เชื่อมระบบ)`;
    return render();
  }

  if (action.startsWith('type:')) {
    state.type = action.slice(5);
    return navigate('space-list');
  }

  if (action.startsWith('space:')) {
    state.space = spaces.find((space) => space.id === action.slice(6)) || null;
    return navigate('space-detail');
  }

  if (action.startsWith('booking:')) {
    state.booking = state.bookings.find((booking) => booking.id === action.slice(8)) || null;
    return navigate('booking-detail');
  }

  if (['checkin', 'extend', 'cancel'].includes(action)) {
    updateBooking(action, state);
    return render();
  }

  navigate(action);
}

export function handleFormSubmit(form, state, navigate) {
  const data = new FormData(form);

  switch (form.dataset.form) {
    case 'login':
      state.userEmail = data.get('email')?.trim() || '';
      state.loginMessage = '';
      navigate('home');
      break;
    case 'search':
      state.query = data.get('query')?.trim() || '';
      state.type = '';
      navigate('search');
      break;
    case 'schedule':
      state.date = data.get('date') || '';
      state.time = data.get('time') || '';
      state.seat = data.get('seat') || '';
      navigate(state.space?.available === false ? 'alternatives' : 'booking-review');
      break;
    case 'attendees':
      createBooking(data, state);
      navigate('booking-confirmed');
      break;
    default:
      break;
  }
}

function updateBooking(action, state) {
  if (!state.booking) return;
  if (action === 'cancel') state.booking.status = 'ยกเลิกแล้ว';
  state.booking.message = {
    checkin: 'เช็กอินแล้ว (ตัวอย่าง)',
    extend: 'ส่งคำขอขยายเวลาแล้ว (ตัวอย่าง)',
    cancel: 'ยกเลิกรายการแล้ว',
  }[action];
}

function createBooking(data, state) {
  state.attendees = data.get('attendees')?.trim() || '';
  state.booking = {
    id: `BK-${Date.now().toString().slice(-6)}`,
    space: state.space,
    date: state.date,
    time: state.time,
    seat: state.seat,
    attendees: state.attendees,
    status: 'ยืนยันแล้ว',
  };
  state.bookings.unshift(state.booking);
}
