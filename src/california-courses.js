// OpenStreetMap course points support discovery and map viewing, not green yardages.
export const californiaRegions = [
  { id: 'inland-empire', label: 'Inland Empire · Sierra Lakes', lat: 34.105, lon: -117.455 },
  { id: 'los-angeles', label: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { id: 'orange-county', label: 'Orange County', lat: 33.6846, lon: -117.8265 },
  { id: 'san-diego', label: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { id: 'bay-area', label: 'San Francisco Bay Area', lat: 37.7749, lon: -122.4194 },
  { id: 'sacramento', label: 'Sacramento', lat: 38.5816, lon: -121.4944 },
  { id: 'monterey', label: 'Monterey Peninsula', lat: 36.6002, lon: -121.8947 },
  { id: 'fresno', label: 'Fresno', lat: 36.7378, lon: -119.7871 },
  { id: 'palm-springs', label: 'Palm Springs', lat: 33.8303, lon: -116.5453 },
]

export function californiaBounds(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon)
    && lat >= 32.5 && lat <= 42.1 && lon >= -124.6 && lon <= -114.1
}

export function distanceMiles(aLat, aLon, bLat, bLon) {
  const rad = (degrees) => degrees * Math.PI / 180
  const dLat = rad(bLat - aLat)
  const dLon = rad(bLon - aLon)
  const term = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2
  return 3958.8 * 2 * Math.atan2(Math.sqrt(term), Math.sqrt(1 - term))
}

export function mapUrl(course) {
  const lat = Number(course.lat)
  const lon = Number(course.lon)
  if (!californiaBounds(lat, lon)) return ''
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`
}

export async function findCaliforniaCourses(lat, lon, fetcher = fetch) {
  if (!californiaBounds(lat, lon)) throw new Error('Select a California region or use location while in California.')
  const query = `[out:json][timeout:20];nwr["leisure"="golf_course"](around:25000,${lat},${lon});out center;`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 18000)
  try {
    const response = await fetcher(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('Course map service is temporarily unavailable. You can enter a course manually.')
    const payload = await response.json()
    const seen = new Set()
    return (Array.isArray(payload.elements) ? payload.elements : [])
      .map((element) => ({
        id: `${element.type}/${element.id}`,
        name: String(element.tags?.name || '').trim(),
        lat: Number(element.lat ?? element.center?.lat),
        lon: Number(element.lon ?? element.center?.lon),
        state: element.tags?.['addr:state'],
      }))
      .filter((course) => course.name && californiaBounds(course.lat, course.lon)
        && (!course.state || /^(CA|California)$/i.test(course.state)))
      .filter((course) => {
        const key = course.name.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((course) => ({ ...course, distance: distanceMiles(lat, lon, course.lat, course.lon) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 25)
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Course search timed out. Try again or enter a course manually.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}
