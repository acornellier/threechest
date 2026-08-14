import { divIcon, type DivIconOptions } from 'leaflet'

interface ScaleVars {
  /**
   * Per-icon base multiplier (e.g. mobScale). Folded into --icon-size, which the icon's
   * contents use to size themselves.
   */
  scale?: number
  /** Extra multiplier applied to the icon box only, e.g. the hover pop. Excluded from --icon-size. */
  boxScale?: number
}

/**
 * A divIcon whose size is driven by CSS rather than by Leaflet's iconSize option.
 *
 * Clearing iconSize/iconAnchor makes Leaflet leave width/height/margins alone, so the
 * `.scaled-icon` rule can derive them from --icon-scaling (set once per zoom frame on the map
 * container by <IconScaling />) times the per-icon vars below. That keeps zooming O(1) in JS
 * instead of re-rendering or hand-patching every icon on every frame.
 *
 * They have to be passed as explicit undefined rather than omitted: L.DivIcon defaults iconSize to
 * [12, 12], and setOptions only shadows that default for keys actually present in the object.
 */
export function scaledDivIcon(
  { className, ...options }: Omit<DivIconOptions, 'iconSize' | 'iconAnchor'>,
  { scale = 1, boxScale = 1 }: ScaleVars = {},
) {
  const icon = divIcon({
    ...options,
    iconSize: undefined,
    iconAnchor: undefined,
    className: `scaled-icon ${className ?? ''}`,
  })

  const createIcon = icon.createIcon.bind(icon)
  icon.createIcon = (oldIcon?: HTMLElement) => {
    const element = createIcon(oldIcon)
    element.style.setProperty('--icon-scale', String(scale))
    element.style.setProperty('--icon-box-scale', String(boxScale))
    return element
  }

  return icon
}
