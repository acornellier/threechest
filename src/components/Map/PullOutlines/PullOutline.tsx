import { Circle as LeafletCircle, Polygon as LeafletPolygon } from 'leaflet'
import { Circle, CircleProps, Polygon, PolygonProps, Tooltip } from 'react-leaflet'
import { memo, useEffect, useMemo, useRef } from 'react'
import { getPullColor } from '../../../util/colors.ts'
import { MobSpawn, Point } from '../../../data/types.ts'
import {
  expandPolygon,
  makeConvexHull,
  mobScaleToRadius,
  PolygonVertex,
} from '../../../util/hull.ts'
import { mobScale } from '../../../util/mobSpawns.ts'
import { selectPull } from '../../../store/routes/routesReducer.ts'
import { Pull } from '../../../util/types.ts'
import { useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'

interface Props {
  pull: Pull
  index: number
  isHovered: boolean
  isSelected: boolean
  faded: boolean
}

interface Outline {
  hull?: Array<Point>
  circle?: { center: Point; radius: number }
}

function createOutline(mobSpawns: MobSpawn[]): Outline {
  if (mobSpawns.length <= 0) return {}

  if (mobSpawns.length === 1) {
    const mobSpawn = mobSpawns[0]!
    const scale = mobScale(mobSpawn)
    return {
      circle: {
        center: mobSpawn.spawn.pos,
        radius: mobScaleToRadius(scale),
      },
    }
  }

  const vertices: PolygonVertex[] = mobSpawns.map((mobSpawn) => ({
    pos: mobSpawn.spawn.pos,
    scale: mobScale(mobSpawn),
  }))

  let hull = makeConvexHull(vertices)
  hull = expandPolygon(hull, 10)
  hull = makeConvexHull(hull)

  return { hull: hull.map((m) => m.pos) }
}

function PullOutlineComponent({ pull, index, isSelected, isHovered, faded }: Props) {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const mobSpawns = useMemo(
    () => pull.spawns.map((spawnId) => dungeon.mobSpawns[spawnId]).filter(Boolean) as MobSpawn[],
    [dungeon, pull.spawns],
  )
  const { hull, circle } = useMemo(() => createOutline(mobSpawns), [mobSpawns])
  const hidden = useMapObjectsHidden(100)

  const polygonRef = useRef<PolygonProps & LeafletPolygon<any>>(null)
  const circleRef = useRef<CircleProps & LeafletCircle<any>>(null)

  const eventHandlers = useMemo(
    () => ({
      click: () => {
        dispatch(selectPull(index))
      },
    }),
    [dispatch, index],
  )

  const tooltipClass = `pull-number-tooltip ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`
  const color = faded ? '#222222' : getPullColor(index)
  const opacity = hidden ? 0 : isSelected || isHovered ? 1 : 0.6
  const weight = isSelected ? 6 : isHovered ? 4.5 : 3.5
  const textOpacity = hidden ? 0 : isSelected || isHovered ? 1 : 0.9

  useEffect(() => {
    if (hull) polygonRef.current?.setLatLngs(hull)
  }, [hull])

  useEffect(() => {
    if (circle) {
      circleRef.current?.setRadius(circle.radius)
      circleRef.current?.setRadius(circle.radius)
    }
  }, [circle])

  useEffect(() => {
    const ref = polygonRef.current ?? circleRef.current
    if (!ref) return

    ref.setStyle({
      color,
      opacity,
      weight,
    })
  }, [color, opacity, weight])

  useEffect(() => {
    const ref = polygonRef.current ?? circleRef.current
    const tooltip = ref?.getTooltip()
    if (!tooltip) return

    tooltip.setOpacity(textOpacity)
    tooltip.setTooltipContent(`${index + 1}`)
    const el = tooltip.getElement()
    if (el) {
      el.classList.toggle('hovered', isHovered)
      el.classList.toggle('selected', isSelected)
    }
    tooltip.update()
  }, [index, isHovered, isSelected, textOpacity])

  // Remember to update the useEffects above when making changes below
  return hull ? (
    <Polygon
      ref={polygonRef}
      positions={hull}
      eventHandlers={eventHandlers}
      color={color}
      fillOpacity={0}
      opacity={opacity}
      weight={weight}
    >
      <Tooltip className={tooltipClass} direction="center" permanent opacity={textOpacity}>
        {index + 1}
      </Tooltip>
    </Polygon>
  ) : circle ? (
    <Circle
      ref={circleRef}
      center={circle.center}
      radius={circle.radius}
      eventHandlers={eventHandlers}
      color={color}
      fillOpacity={0}
      opacity={opacity}
      weight={weight}
    >
      <Tooltip
        className={tooltipClass}
        direction="center"
        permanent
        opacity={textOpacity}
        offset={[0, -15]}
      >
        {index + 1}
      </Tooltip>
    </Circle>
  ) : null
}

export const PullOutline = memo(PullOutlineComponent)
