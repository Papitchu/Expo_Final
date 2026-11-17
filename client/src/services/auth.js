import { api } from './api.js'

export const login = (email, password) => api('/auth/login', { method: 'POST', body: { email, password } })
export const fetchMe = () => api('/auth/me').then((data) => data.user)
