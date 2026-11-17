import { useCallback, useEffect, useState } from 'react'

const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

/** status: 'locating' | 'ok' | 'denied' | 'error' | 'unavailable' */
export function useGeolocation() {
  const [state, setState] = useState({ status: supported ? 'locating' : 'unavailable', coords: null })

  const request = useCallback(() => {
    if (!supported) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setState({ status: 'ok', coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) => setState({ status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error', coords: null }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    )
  }, [])

  useEffect(request, [request])

  const retry = useCallback(() => {
    setState({ status: 'locating', coords: null })
    request()
  }, [request])

  return { ...state, retry }
}
