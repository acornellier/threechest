import { Pull } from '../../code/types.ts'
import { Circle, Polygon, Tooltip, useMap } from 'react-leaflet'
import { memo, useEffect, useMemo, useState } from 'react'
import { Map } from 'leaflet'
import makeHull from 'hull.js'
import Offset from 'polygon-offset'
import { useAppSelector } from '../../store/hooks.ts'
import { getPullColor } from '../../code/colors.ts'

interface Props {
  pullId: number
  index: number
  isHovered: boolean
  isSelected: boolean
}

interface Outline {
  hull?: Array<[number, number]>
  circle?: { center: [number, number]; radius: number }
}

function createOutline(pull: Pull, map: Map): Outline {
  if (pull.mobSpawns.length <= 0) return {}

  if (pull.mobSpawns.length === 1) {
    return {
      circle: { center: pull.mobSpawns[0].spawn.pos, radius: 3 },
    }
  }

  let hull = makeHull(
    pull.mobSpawns.map((mobSpawn) => mobSpawn.spawn.pos),
    Infinity,
  )

  const arcSegments = Math.max(5, 9 - hull.length + 2 * map.getZoom())
  const margin = 2.8
  hull = new Offset().data(hull).arcSegments(arcSegments).margin(margin)[0]

  return { hull }
}

function PullOutlineComponent({ pullId, index, isSelected, isHovered }: Props) {
  const map = useMap()
  const pull = useAppSelector((state) => state.route.pulls.find((pull) => pull.id === pullId))!
  const { hull, circle } = useMemo(() => createOutline(pull, map), [pull, map])
  const pullColor = getPullColor(index)

  // Change key to force re-render
  const [key, setKey] = useState(0)
  useEffect(() => {
    setKey((prevKey) => prevKey + 1000)
  }, [isHovered, isSelected, pullId])

  return circle ? (
    <Circle
      key={key}
      center={circle.center}
      radius={circle.radius}
      color={pullColor}
      fillOpacity={0}
      opacity={isSelected || isHovered ? 1 : 0.6}
      weight={isSelected ? 6 : isHovered ? 5 : 3.5}
    >
      <Tooltip className="pull-number-tooltip" direction="center" permanent offset={[0, -15]}>
        {index + 1}
      </Tooltip>
    </Circle>
  ) : hull ? (
    <Polygon
      key={key}
      positions={hull}
      color={pullColor}
      fillOpacity={0}
      opacity={isSelected || isHovered ? 1 : 0.6}
      weight={isSelected ? 6 : isHovered ? 5 : 3.5}
    >
      <Tooltip className="pull-number-tooltip" direction="center" permanent>
        {index + 1}
      </Tooltip>
    </Polygon>
  ) : null
}

export const PullOutline = memo(PullOutlineComponent)
