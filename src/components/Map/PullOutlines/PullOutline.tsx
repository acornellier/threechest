import type { Circle as LeafletCircle, Polygon as LeafletPolygon } from 'leaflet'
import type { CircleProps, PolygonProps } from 'react-leaflet'
import { Circle, Polygon, Tooltip } from 'react-leaflet'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { getPullColor } from '../../../util/colors.ts'
import { createOutline } from './createOutline.ts'
import { selectPull } from '../../../store/routes/routesReducer.ts'
import type { Pull } from '../../../util/types.ts'
import { useMapObjectsHidden } from '../../../store/reducers/mapReducer.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'

interface Props {
  pull: Pull
  index: number
  isHovered: boolean
  isSelected: boolean
  faded: boolean
  /** Kept mounted rather than unmounted, so re-showing doesn't replay the staggered fade-in. */
  forceHidden?: boolean
}

function PullOutlineComponent({
  pull,
  index,
  isSelected,
  isHovered,
  faded,
  forceHidden,
}: Props) {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const mobSpawns = useMemo(
    () => pull.spawns.map((spawnId) => dungeon.mobSpawns[spawnId]).filter(Boolean),
    [dungeon, pull.spawns],
  )
  const { hull, circle } = useMemo(() => createOutline(mobSpawns), [mobSpawns])
  const hidden = useMapObjectsHidden(100) || !!forceHidden

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

  const [key, setKey] = useState(0)
  useEffect(() => {
    setKey((v) => v + 1)
    // if (hull) polygonRef.current?.setLatLngs(hull)
    // if (circle) {
    //   circleRef.current?.setRadius(circle.radius)
    //   circleRef.current?.setRadius(circle.radius)
    // }
  }, [hull, circle])

  useEffect(() => {
    const ref = polygonRef.current ?? circleRef.current
    if (!ref) return

    ref.setStyle({
      color,
      opacity,
      weight,
    })

    const el = ref.getElement() as SVGElement | undefined
    if (el) el.style.pointerEvents = opacity === 0 ? 'none' : ''
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
      key={key}
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
      key={key}
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
