import {
  FeatureGroup,
  LatLng,
  LatLngLiteral,
  LayerOptions,
  LeafletEvent,
  LeafletMouseEvent,
  Map,
  Point,
} from 'leaflet'
import { curveMonotoneX, line } from 'd3-shape'
import { select } from 'd3-selection'

export const MODES = {
  VIEW: 1,
  CREATE: 2,
  EDIT: 4,
  DELETE: 8,
  APPEND: 16,
  EDIT_APPEND: 4 | 16,
  ALL: 1 | 2 | 4 | 8 | 16,
}

export type Mode = keyof typeof MODES

export interface PatherOptions extends LayerOptions {
  mode: number
  simplifyThreshold: number
  strokeColor: string
  strokeWidth: number
  detectTouch?: boolean
}

export const defaultOptions: PatherOptions = {
  mode: MODES.ALL,
  simplifyThreshold: 1,
  strokeColor: 'rgba(0,0,0,.5)',
  strokeWidth: 2,
  detectTouch: true,
}

export interface CreatedEvent extends LeafletEvent {
  latLngs: LatLngLiteral[]
}

export class Pather extends FeatureGroup {
  options: PatherOptions
  map?: Map
  element?: HTMLElement
  svg?: any

  constructor(options: Partial<PatherOptions>) {
    super()
    this.options = { ...defaultOptions, ...options }
  }

  createPath(latLngs: LatLng[]) {
    if (latLngs.length <= 1) {
      return false
    }

    this.clearAll()
    this.fire('created', {
      latLngs: this.simplifyLine(latLngs),
    })
  }

  simplifyLine(latLngs: LatLngLiteral[]): LatLngLiteral[] {
    const points = latLngs.map(({ lat, lng }) => ({ y: lat, x: lng }))
    const simplifiedPoints = rdpSimplification(points, this.options.simplifyThreshold)
    return simplifiedPoints.map(({ x, y }) => ({ lat: y, lng: x }))
  }

  onAdd(map: Map) {
    this.element = map.getContainer()
    this.map = map
    this.svg = select(this.element!)
      .append('svg')
      .classed('free-draw', true)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('pointer-events', 'none')
      .style('z-index', '1001')
      .style('position', 'relative')

    map.dragging.disable()

    // Attach the mouse events for drawing the polyline.
    this.attachEvents(map)
    this.setMode(this.options.mode)
    return this
  }

  createPathTemp(fromPoint: LatLng | Point) {
    let lastPoint = fromPoint

    const lineFunction = line()
      .curve(curveMonotoneX)
      .x((d) => (d as any).x)
      .y((d) => (d as any).y)

    return (toPoint: LatLng | Point) => {
      const lineData = [lastPoint, toPoint]
      lastPoint = toPoint
      // Draw SVG line based on the last movement of the mouse's position.
      this.svg
        .append('path')
        .classed('leaflet-line', true)
        .attr('d', lineFunction(lineData as any))
        .attr('fill', 'none')
        .attr('stroke', this.options.strokeColor)
        .attr('stroke-width', this.options.strokeWidth)
    }
  }

  onRemove(map: Map) {
    this.svg.remove()

    if (this.element) {
      this.element.classList.remove('mode-create')
      this.element.classList.remove('mode-delete')
      this.element.classList.remove('mode-edit')
      this.element.classList.remove('mode-append')
    }

    const tileLayer = map.getContainer().querySelector('.leaflet-tile-pane') as HTMLElement
    if (tileLayer && tileLayer.style) tileLayer.style.pointerEvents = 'all'
    map.dragging.enable()
    return this
  }

  isPolylineCreatable() {
    return !!(this.options.mode & MODES.CREATE)
  }

  clearAll() {
    this.svg.text('')
  }

  shouldDisableDrag() {
    if (this.options.detectTouch && ('ontouchstart' in window || 'onmsgesturechange' in window)) {
      return this.options.mode & MODES.CREATE || this.options.mode & MODES.EDIT
    }

    return this.options.mode & MODES.CREATE
  }

  setOptions(options: Partial<PatherOptions>) {
    this.options = { ...this.options, ...options }
  }

  setMode(mode: number) {
    this.setClassName(mode)
    this.options.mode = mode

    const tileLayer = this.map!.getContainer().querySelector('.leaflet-tile-pane') as HTMLElement

    if (this.shouldDisableDrag()) {
      if (tileLayer && tileLayer.style) tileLayer.style.pointerEvents = 'none'
      this.map!.dragging.disable()
      return
    }

    tileLayer.style.pointerEvents = 'all'
    this.map!.dragging.enable()
  }

  setStrokeColor(strokeColor: string) {
    this.options.strokeColor = strokeColor
    this.svg.attr('stroke-color', strokeColor)
  }

  setClassName(mode: number) {
    const conditionallyAppendClassName = (modeName: Mode) => {
      const className = ['mode', modeName.toLocaleLowerCase()].join('-')

      if (MODES[modeName] & mode) {
        return void this.element!.classList.add(className)
      }

      this.element!.classList.remove(className)
    }

    conditionallyAppendClassName('CREATE')
    conditionallyAppendClassName('DELETE')
    conditionallyAppendClassName('EDIT')
    conditionallyAppendClassName('APPEND')
  }

  attachEvents(map: Map) {
    let dragging = false
    const mouseDown = (event: LeafletMouseEvent) => {
      if (dragging) return

      // On middle mouse button
      if (event.originalEvent.button === 1) {
        dragging = true
        map.dragging.enable()
        // Re-send the cloned event so that the map receives it with dragging enabled
        const eventClone = new MouseEvent(event.originalEvent.type, event.originalEvent)
        map.getContainer().dispatchEvent(eventClone)

        const mouseUp = () => {
          dragging = false
          map.dragging.disable()
        }

        map.on('mouseup', mouseUp)
        return
      }

      if (!this.isPolylineCreatable()) return

      const latLngs = new Set<LatLng>()

      const lineIterator = this.createPathTemp(map.latLngToContainerPoint(event.latlng))

      const mouseMove = (event: LeafletMouseEvent) => {
        const point: Point = map.mouseEventToContainerPoint(event.originalEvent)

        // Push each lat/lng value into the points set.
        latLngs.add(map.containerPointToLatLng(point))

        // Invoke the generator by passing in the starting point for the path.
        lineIterator(new Point(point.x, point.y))
      }

      const mouseUp = () => {
        map.off('mouseup', mouseUp)
        map.off('mousemove', mouseMove)
        map.getContainer().removeEventListener('mouseleave', mouseLeave)

        this.clearAll()
        this.createPath(Array.from(latLngs))
      }

      const mouseLeave = () => {
        this.clearAll()
      }

      map.on('mousemove', mouseMove)
      map.on('mouseup', mouseUp)
      map.getContainer().addEventListener('mouseleave', mouseLeave)
    }
    map.on('mousedown', mouseDown)
  }
}

function rdpSimplification(
  l: Array<{ x: number; y: number }>,
  eps: number,
): Array<{ x: number; y: number }> {
  if (l.length <= 1) return l

  const last = l.length - 1
  const p1 = l[0]!
  const p2 = l[last]!
  const x21 = p2.x - p1.x
  const y21 = p2.y - p1.y

  const [dMax, x] = l
    .slice(1, last)
    .map((p) => Math.abs(y21 * p.x - x21 * p.y + p2.x * p1.y - p2.y * p1.x))
    .reduce(
      (p, c, i) => {
        const v = Math.max(p[0], c)
        return [v, v === p[0] ? p[1] : i + 1]
      },
      [-1, 0],
    )

  if (dMax > eps) {
    return [
      ...rdpSimplification(l.slice(0, x + 1), eps),
      ...rdpSimplification(l.slice(x), eps).slice(1),
    ]
  }
  return [l[0]!, l[last]!]
}
