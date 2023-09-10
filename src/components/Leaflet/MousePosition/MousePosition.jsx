import { useMap } from 'react-leaflet'
import './L.MousePosition.js'
import L from 'leaflet'
import { useEffect } from 'react'

export function MousePosition() {
  const map = useMap()

  useEffect(() => {
    L.control.mousePosition().addTo(map)
  }, [])

  return null
}
