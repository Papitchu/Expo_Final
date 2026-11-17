import { api } from '../api.js';

const STATUS_TH = {
  confirmed: 'ยืนยันแล้ว',
  checked_in: 'เช็กอินแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

/** Converts an API booking row into the shape the page modules already use. */
export function toViewBooking(row) {
  return {
    id: `BK-${String(row.id).padStart(6, '0')}`,
    dbId: row.id,
    space: { id: row.spaceId, name: row.spaceName },
    date: row.date,
    time: row.slot,
    seat: row.seat,
    attendees: row.attendees,
    status: STATUS_TH[row.status] || row.status,
  };
}

export async function refreshSpaces(state) {
  state.spaces = await api('/spaces');
}

export async function loadBookings(state) {
  const rows = await api('/bookings');
  state.bookings = rows.map(toViewBooking);
}
