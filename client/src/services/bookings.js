import { api } from './api.js'

const unwrap = (data) => data.booking

export const myBookings = () => api('/bookings/me').then((data) => data.bookings)
export const getBooking = (id) => api(`/bookings/${encodeURIComponent(id)}`).then(unwrap)
export const createBooking = (input) => api('/bookings', { method: 'POST', body: input }).then(unwrap)
export const cancelBooking = (id) =>
  api(`/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body: { action: 'cancel' } }).then(unwrap)
export const checkInBooking = (id) =>
  api(`/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body: { action: 'checkin' } }).then(unwrap)
export const previewInvite = (token) => api(`/bookings/invite/${encodeURIComponent(token)}`).then(unwrap)
export const joinInvite = (token) =>
  api(`/bookings/join/${encodeURIComponent(token)}`, { method: 'POST' }).then(unwrap)
