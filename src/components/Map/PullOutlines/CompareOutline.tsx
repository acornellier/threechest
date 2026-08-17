import type { Circle as LeafletCircle, Polygon as LeafletPolygon } from 'leaflet'
import type { CircleProps, PolygonProps } from 'react-leaflet'
import { Circle, Polygon, Tooltip } from 'react-leaflet'
import { memo, useEffect, useMemo, useRef } from 'react'
import { getPullColor } from '../../../util/colors.ts'
import { createOutline } from './createOutline.ts'
import type { Pull } from '../../../util/types.ts'
import { useDungeon } from '../../../store/routes/routeHooks.ts'

interface Props {
  pull: Pull
  index: number
  isHighlighted: boolean
}

// The dark casing under the dashes is what separates a ghost from a real pull of the same color.
const casingColor = '#000000'
const dashArray = '7 7'

function CompareOutlineComponent({ pull, index, isHighlighted }: Props) {
  const dungeon = useDungeon()
  const mobSpawns = useMemo(
    () => pull.spawns.map((spawnId) => dungeon.mobSpawns[spawnId]).filter(Boolean),
    [dungeon, pull.spawns],
  )
  const { hull, circle } = useMemo(() => createOutline(mobSpawns), [mobSpawns])

  const polygonRef = useRef<PolygonProps & LeafletPolygon<any>>(null)
  const circleRef = useRef<CircleProps & LeafletCircle<any>>(null)
  const casingPolygonRef = useRef<PolygonProps & LeafletPolygon<any>>(null)
  const casingCircleRef = useRef<CircleProps & LeafletCircle<any>>(null)

  const ghostColor = getPullColor(index)
  const opacity = isHighlighted ? 1 : 0.85
  const weight = isHighlighted ? 4 : 2.5
  const casingWeight = weight + 3
  const tooltipClass = `compare-pull-number-tooltip ${isHighlighted ? 'highlighted' : ''}`

  // react-leaflet only restyles on pathOptions, so keep these in sync with the props below.
  useEffect(() => {
    const ref = polygonRef.current ?? circleRef.current
    const casingRef = casingPolygonRef.current ?? casingCircleRef.current

    casingRef?.setStyle({ weight: casingWeight, opacity: opacity * 0.6 })
    if (!ref) return

    ref.setStyle({ color: ghostColor, opacity, weight })

    const el = ref.getTooltip()?.getElement()
    if (!el) return

    el.classList.toggle('highlighted', isHighlighted)
    el.style.backgroundColor = getPullColor(index, true)
    el.style.borderColor = ghostColor
  }, [casingWeight, ghostColor, index, isHighlighted, opacity, weight])

  const shared = { dashArray, fillOpacity: 0, interactive: false }
  const casing = {
    ...shared,
    color: casingColor,
    opacity: opacity * 0.6,
    weight: casingWeight,
  }
  const ghost = { ...shared, color: ghostColor, opacity, weight }

  if (hull) {
    return (
      <>
        <Polygon ref={casingPolygonRef} positions={hull} {...casing} />
        <Polygon ref={polygonRef} positions={hull} {...ghost}>
          <Tooltip className={tooltipClass} direction="center" permanent>
            {index + 1}
          </Tooltip>
        </Polygon>
      </>
    )
  }

  if (!circle) return null

  return (
    <>
      <Circle ref={casingCircleRef} center={circle.center} radius={circle.radius} {...casing} />
      <Circle ref={circleRef} center={circle.center} radius={circle.radius} {...ghost}>
        <Tooltip className={tooltipClass} direction="center" permanent offset={[0, -15]}>
          {index + 1}
        </Tooltip>
      </Circle>
    </>
  )
}

export const CompareOutline = memo(CompareOutlineComponent)
