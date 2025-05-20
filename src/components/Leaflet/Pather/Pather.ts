import type {
  LatLng,
  LatLngLiteral,
  LayerOptions,
  LeafletEvent,
  LeafletMouseEvent,
  Map,
} from 'leaflet'
import { FeatureGroup, Point } from 'leaflet'
import { curveMonotoneX, line } from 'd3-shape'
import { select } from 'd3-selection'
import type { DrawMode } from '../../../store/reducers/mapReducer.ts'

export interface PatherOptions extends LayerOptions {
  mode: DrawMode
  simplifyThreshold: number
  strokeColor: string
  strokeWidth: number
}

export const defaultOptions: PatherOptions = {
  mode: 'drawing',
  simplifyThreshold: 1,
  strokeColor: 'rgba(0,0,0,.5)',
  strokeWidth: 2,
}

export interface CreatedEvent extends LeafletEvent {
  latLngs: LatLngLiteral[]
}

interface LeafletTouchEvent {
  latlng: LatLng
  layerPoint: Point
  containerPoint: Point
  originalEvent: TouchEvent
}

export class Pather extends FeatureGroup {
  options: PatherOptions
  map?: Map
  element?: HTMLElement
  svg?: any
  dragging?: boolean
  clearSvgTimer?: NodeJS.Timeout
  mouseDownCallback?: (event: any) => void

  constructor(options: Partial<PatherOptions>) {
    super()
    this.options = { ...defaultOptions, ...options }
  }

  createPath(latLngs: LatLng[]) {
    if (latLngs.length <= 1) {
      return false
    }

    // give map a second to draw it before clearing
    this.clearSvgTimer = setTimeout(() => this.svg.text(''), 500)
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
        .attr('fill', this.options.strokeColor)
        .attr('stroke', this.options.strokeColor)
        .attr('stroke-width', this.options.strokeWidth)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
    }
  }

  onRemove(map: Map) {
    this.svg.remove()

    if (this.element) {
      this.element!.classList.remove(this.modeToClassName(this.options.mode))
    }

    const tileLayer = map.getContainer().querySelector('.leaflet-tile-pane') as HTMLElement
    if (tileLayer && tileLayer.style) tileLayer.style.pointerEvents = 'all'
    map.dragging.enable()

    map.off('mousedown', this.mouseDownCallback)
    map.off('touchstart', this.mouseDownCallback)

    return this
  }

  setOptions(options: Partial<PatherOptions>) {
    this.options = { ...this.options, ...options }
  }

  setMode(mode: DrawMode) {
    this.element!.classList.remove(this.modeToClassName(this.options.mode))
    this.element!.classList.add(this.modeToClassName(mode))
    this.options.mode = mode

    const tileLayer = this.map!.getContainer().querySelector('.leaflet-tile-pane') as HTMLElement

    if (tileLayer && tileLayer.style) tileLayer.style.pointerEvents = 'none'
    this.map!.dragging.disable()
  }

  modeToClassName(mode: DrawMode) {
    return `mode-${mode}`
  }

  setStrokeColor(strokeColor: string) {
    this.options.strokeColor = strokeColor
    this.svg.attr('stroke-color', strokeColor)
  }

  attachEvents(map: Map) {
    this.mouseDownCallback = this.mouseDown.bind(this)
    map.on('mousedown', this.mouseDownCallback)
    map.on('touchstart', this.mouseDownCallback)
  }

  mouseDown(event: LeafletMouseEvent | LeafletTouchEvent) {
    event.originalEvent.preventDefault()

    if (this.dragging) return

    // On middle mouse button
    if ('button' in event.originalEvent && event.originalEvent.button === 1) {
      this.dragging = true
      this.map!.dragging.enable()
      // Re-send the cloned event so that the map receives it with dragging enabled
      const eventClone = new MouseEvent(event.originalEvent.type, event.originalEvent)
      this.map!.getContainer().dispatchEvent(eventClone)

      const mouseUp = () => {
        this.dragging = false
        this.map!.dragging.disable()
      }

      this.map!.on('mouseup', mouseUp)
      this.map!.on('touchend', mouseUp)
      return
    }

    if (this.options.mode !== 'drawing') {
      return
    }

    if (this.clearSvgTimer) {
      clearTimeout(this.clearSvgTimer)
      this.svg.text('')
    }

    const latLngs = new Set<LatLng>()

    const lineIterator = this.createPathTemp(this.map!.latLngToContainerPoint(event.latlng))

    const mouseMove = (event: LeafletMouseEvent) => {
      const point = event.containerPoint

      // Push each lat/lng value into the points set.
      latLngs.add(event.latlng)

      // Invoke the generator by passing in the starting point for the path.
      lineIterator(new Point(point.x, point.y))
    }

    const mouseUp = () => {
      this.map!.off('mousemove', mouseMove)
      this.map!.off('touchmove', mouseMove as any)
      this.map!.off('mouseup', mouseUp)
      this.map!.off('touchend', mouseUp)

      this.createPath(Array.from(latLngs))
    }

    this.map!.on('mousemove', mouseMove)
    this.map!.on('touchmove', mouseMove as any)
    this.map!.on('mouseup', mouseUp)
    this.map!.on('touchend', mouseUp)
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
