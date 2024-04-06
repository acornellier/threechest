import { useMapEvent } from 'react-leaflet'
import { useCallback, useState } from 'react'
import { LatLngLiteral, LeafletMouseEvent } from 'leaflet'
import { roundTo } from '../../util/numbers.ts'
import { Portal } from 'react-portal'

export function MousePosition() {
  const [{ lat, lng }, setLatLng] = useState<LatLngLiteral>({ lat: 0, lng: 0 })

  const onMouseMove = useCallback((e: LeafletMouseEvent) => {
    setLatLng(e.latlng)
  }, [])

  useMapEvent('mousemove', onMouseMove)

  return (
    <Portal>
      <div className="fixed bottom-0 bg-white text-black text-xs px-1 z-[9999] rounded-r-sm">
        {roundTo(lat, 1)}, {roundTo(lng, 1)}
      </div>
    </Portal>
  )
}
