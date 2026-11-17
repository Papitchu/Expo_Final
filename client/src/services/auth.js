import { api } from './api.js'

export const login = (email, password) =>
  api('/auth/login', { method: 'POST', body: { email, password } }).then((data) => data.user)
export const logout = () => api('/auth/logout', { method: 'POST' })
export const fetchMe = () => api('/auth/me').then((data) => data.user)
