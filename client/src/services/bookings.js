import { api } from './api.js'

const unwrap = (data) => data.booking
const path = (id) => `/bookings/${encodeURIComponent(id)}`

export const myBookings = () => api('/bookings').then((data) => data.bookings)
export const getBooking = (id) => api(path(id)).then(unwrap)
export const createBooking = (input) => api('/bookings', { method: 'POST', body: input }).then(unwrap)
export const cancelBooking = (id) => api(`${path(id)}/cancel`, { method: 'POST' }).then(unwrap)
export const checkInBooking = (id) => api(`${path(id)}/checkin`, { method: 'POST' }).then(unwrap)
export const previewInvite = (token) => api(`/bookings/invite/${encodeURIComponent(token)}`).then(unwrap)
export const joinInvite = (token) =>
  api(`/bookings/join/${encodeURIComponent(token)}`, { method: 'POST' }).then(unwrap)
