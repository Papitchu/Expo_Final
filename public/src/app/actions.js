import { flow } from '../data/flow.js';
import { api } from '../api.js';
import { refreshSpaces, loadBookings, toViewBooking } from './data.js';

export async function handleAction(action, state, navigate, render) {
  if (action === 'onboarding-next') {
    state.onboardingIndex += 1;
    if (state.onboardingIndex >= flow.onboarding.length) return navigate('login');
    return render();
  }

  if (action === 'all-spaces') {
    state.type = '';
    await refreshSpaces(state);
    return navigate('space-list');
  }

  if (action.startsWith('auth:')) {
    const provider = action.slice(5);
    state.loginMessage = `เลือกเข้าสู่ระบบด้วย ${provider} แล้ว (ยังไม่ได้เชื่อมระบบ)`;
    return render();
  }

  if (action.startsWith('type:')) {
    state.type = action.slice(5);
    await refreshSpaces(state);
    return navigate('space-list');
  }

  if (action.startsWith('space:')) {
    // Space detail from the database, including its seats.
    state.space = await api(`/spaces/${encodeURIComponent(action.slice(6))}`);
    return navigate('space-detail');
  }

  if (action.startsWith('booking:')) {
    state.booking = state.bookings.find((booking) => booking.id === action.slice(8)) || null;
    return navigate('booking-detail');
  }

  if (['checkin', 'extend', 'cancel'].includes(action)) {
    await updateBooking(action, state);
    return render();
  }

  if (action === 'my-bookings') {
    await loadBookings(state);
    return navigate('my-bookings');
  }

  if (action === 'schedule' && state.screen === 'booking-detail' && state.booking) {
    // "Change" button on a booking: make sure the space (and its seats) is loaded.
    state.space = await api(`/spaces/${encodeURIComponent(state.booking.space.id)}`);
  }

  navigate(action);
}

export async function handleFormSubmit(form, state, navigate, render) {
  const data = new FormData(form);

  switch (form.dataset.form) {
    case 'login':
      // Still local only: real sign-in comes in the auth step.
      state.userEmail = data.get('email')?.trim() || '';
      state.loginMessage = '';
      navigate('home');
      break;
    case 'search':
      state.query = data.get('query')?.trim() || '';
      state.type = '';
      await refreshSpaces(state);
      navigate('search');
      break;
    case 'schedule':
      await checkAvailability(data, state, navigate, render);
      break;
    case 'attendees':
      await createBooking(data, state, navigate);
      break;
    default:
      break;
  }
}

async function checkAvailability(data, state, navigate, render) {
  state.date = data.get('date') || '';
  state.time = data.get('time') || '';
  const seat = state.space?.seats?.find((item) => item.id === Number(data.get('seat')));
  if (!seat) {
    state.error = 'กรุณาเลือกที่นั่งหรือห้อง';
    return render();
  }
  state.seatId = seat.id;
  state.seat = seat.label;

  const query = `date=${encodeURIComponent(state.date)}&slot=${encodeURIComponent(state.time)}`;
  const freeSeats = await api(`/spaces/${encodeURIComponent(state.space.id)}/availability?${query}`);
  return navigate(freeSeats.some((item) => item.id === seat.id) ? 'booking-review' : 'alternatives');
}

async function createBooking(data, state, navigate) {
  state.attendees = data.get('attendees')?.trim() || '';
  try {
    const row = await api('/bookings', {
      method: 'POST',
      body: { seatId: state.seatId, date: state.date, slot: state.time, attendees: state.attendees },
    });
    state.booking = toViewBooking(row);
    state.bookings.unshift(state.booking);
    navigate('booking-confirmed');
  } catch (error) {
    // Someone else took the seat between "check" and "confirm".
    if (error.status === 409) return navigate('alternatives');
    throw error;
  }
}

async function updateBooking(action, state) {
  if (!state.booking) return;
  if (action === 'extend') {
    // Not stored yet: extending needs booking rules first.
    state.booking.message = 'ส่งคำขอขยายเวลาแล้ว (ตัวอย่าง)';
    return;
  }
  const row = await api(`/bookings/${state.booking.dbId}/${action}`, { method: 'POST' });
  Object.assign(state.booking, toViewBooking(row), {
    message: action === 'checkin' ? 'เช็กอินแล้ว' : 'ยกเลิกรายการแล้ว',
  });
}
