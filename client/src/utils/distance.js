const EARTH_RADIUS_M = 6_371_000
const toRad = (deg) => (deg * Math.PI) / 180

/** Great-circle distance in metres between two { lat, lng } points. */
export function haversine(a, b) {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function formatDistance(metres) {
  if (metres == null) return ''
  return metres < 1000 ? `${Math.round(metres)} ม.` : `${(metres / 1000).toFixed(1)} กม.`
}
