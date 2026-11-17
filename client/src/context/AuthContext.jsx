import { useCallback, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler } from '../services/api.js'
import { fetchMe, login as loginRequest, logout as logoutRequest } from '../services/auth.js'
import { AuthContext } from './auth.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  const clearSession = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(clearSession)
  }, [clearSession])

  // Returning visitor: the session cookie (7 days) is checked once on boot.
  useEffect(() => {
    fetchMe()
      .then((me) => {
        setUser(me)
        setStatus('authenticated')
      })
      .catch(clearSession)
  }, [clearSession])

  const login = useCallback(async (email, password) => {
    const me = await loginRequest(email, password)
    setUser(me)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    await logoutRequest().catch(() => {})
    clearSession()
  }, [clearSession])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
