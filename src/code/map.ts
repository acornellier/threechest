import type { Map } from 'leaflet'

export const mapIconSize = (map: Map) => 5 * 2 ** map.getZoom()
