import { useMap } from 'react-leaflet'
import './L.Control.MousePosition.js'
import L from 'leaflet'

export function MousePosition() {
  const map = useMap()
  L.control.mousePosition().addTo(map)
  return null
}
