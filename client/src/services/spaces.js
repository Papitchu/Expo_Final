import { api } from './api.js'

export const listSpaces = () => api('/spaces').then((data) => data.spaces)
export const getSpace = (id) => api(`/spaces/${encodeURIComponent(id)}`).then((data) => data.space)
export const getAvailability = (id, date) =>
  api(`/spaces/${encodeURIComponent(id)}/availability?date=${date}`).then((data) => data.slots)
