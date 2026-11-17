import { useCallback, useEffect, useMemo, useState } from 'react'
import { setUnauthorizedHandler, tokenStore } from '../services/api.js'
import { fetchMe, login as loginRequest } from '../services/auth.js'
import { AuthContext } from './auth.js'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (tokenStore.get() ? 'loading' : 'anonymous'))

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
    setStatus('anonymous')
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  // Returning visitor: validate the stored token once on boot.
  useEffect(() => {
    if (!tokenStore.get()) return
    fetchMe()
      .then((me) => {
        setUser(me)
        setStatus('authenticated')
      })
      .catch(logout)
  }, [logout])

  const login = useCallback(async (email, password) => {
    const { token, user: me } = await loginRequest(email, password)
    tokenStore.set(token)
    setUser(me)
    setStatus('authenticated')
  }, [])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
