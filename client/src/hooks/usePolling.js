import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs `fetcher` now and every `intervalMs` (0 = once). Re-runs when `key` changes.
 * Returns { data, error, loading, refresh }.
 */
export function usePolling(fetcher, intervalMs, key = '') {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const fetcherRef = useRef(fetcher)
  const runRef = useRef(0)

  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refresh = useCallback(async () => {
    const run = runRef.current
    try {
      const data = await fetcherRef.current()
      if (run === runRef.current) setState({ data, error: null, loading: false })
    } catch (error) {
      if (run === runRef.current) setState((prev) => ({ ...prev, error, loading: false }))
    }
  }, [])

  useEffect(() => {
    runRef.current += 1 // ignore responses from a previous key
    refresh()
    if (!intervalMs) return undefined
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs, key])

  return { ...state, refresh }
}
