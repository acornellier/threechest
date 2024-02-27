import type { Map } from 'leaflet'

export const mapIconScaling = (map: Map) => 5 * 2 ** map.getZoom()
