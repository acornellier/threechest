import { Circle, Polygon, Tooltip } from 'react-leaflet'
import { memo, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useDungeon, useRoutesSelector } from '../../store/hooks.ts'
import { getPullColor } from '../../util/colors.ts'
import { Dungeon, MobSpawn, Point } from '../../data/types.ts'
import { expandPolygon, iconSizeMagicScaling, makeConvexHull } from '../../util/hull.ts'
import { findMobSpawn, mobScale } from '../../util/mobSpawns.ts'
import { selectPull } from '../../store/routesReducer.ts'

interface Props {
  pullId: number
  index: number
  isHovered: boolean
  isSelected: boolean
}

interface Outline {
  hull?: Array<Point>
  circle?: { center: Point; radius: number }
}

function createOutline(mobSpawns: MobSpawn[], dungeon: Dungeon): Outline {
  if (mobSpawns.length <= 0) return {}

  if (mobSpawns.length === 1) {
    const mobSpawn = mobSpawns[0]!
    const scale = mobScale(mobSpawn.mob)
    return {
      circle: {
        center: mobSpawn.spawn.pos,
        radius:
          scale *
          iconSizeMagicScaling *
          (mobSpawn.mob.isBoss ? 1.1 : 1) *
          (dungeon.iconScaling ?? 1),
      },
    }
  }

  const vertices = mobSpawns.map((mobSpawn) => ({
    pos: mobSpawn.spawn.pos,
    scale: mobScale(mobSpawn.mob) * (dungeon.iconScaling ?? 1),
  }))

  let hull = makeConvexHull(vertices)
  hull = expandPolygon(hull, 10)
  hull = makeConvexHull(hull)

  return { hull: hull.map((m) => m.pos) }
}

function PullOutlineComponent({ pullId, index, isSelected, isHovered }: Props) {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const pull = useRoutesSelector((state) => state.route.pulls.find((pull) => pull.id === pullId))!
  const mobSpawns = useMemo(
    () => pull.spawns.concat(pull.tempSpawns).map((spawnId) => findMobSpawn(spawnId, dungeon)),
    [dungeon, pull.spawns, pull.tempSpawns],
  )
  const { hull, circle } = useMemo(() => createOutline(mobSpawns, dungeon), [mobSpawns, dungeon])
  const pullColor = getPullColor(index)

  // Change key to force re-render
  const [key, setKey] = useState(0)
  useEffect(() => {
    setKey((prevKey) => prevKey + 1000)
  }, [isHovered, isSelected, pull, index])

  const eventHandlers = useMemo(
    () => ({
      click: () => {
        dispatch(selectPull(index))
      },
    }),
    [dispatch, index],
  )

  return circle ? (
    <Circle
      key={key}
      center={circle.center}
      radius={circle.radius}
      eventHandlers={eventHandlers}
      color={pullColor}
      fillOpacity={0}
      opacity={isSelected || isHovered ? 1 : 0.6}
      weight={isSelected ? 6 : isHovered ? 5 : 3.5}
    >
      <Tooltip
        className={`pull-number-tooltip ${isHovered ? 'hovered' : ''}`}
        direction="center"
        permanent
        offset={[0, -15]}
      >
        {index + 1}
      </Tooltip>
    </Circle>
  ) : hull ? (
    <Polygon
      key={key}
      positions={hull}
      eventHandlers={eventHandlers}
      color={pullColor}
      fillOpacity={0}
      opacity={isSelected || isHovered ? 1 : 0.6}
      weight={isSelected ? 6 : isHovered ? 5 : 3.5}
    >
      <Tooltip
        className={`pull-number-tooltip ${isHovered ? 'hovered' : ''}`}
        direction="center"
        permanent
      >
        {index + 1}
      </Tooltip>
    </Polygon>
  ) : null
}

export const PullOutline = memo(PullOutlineComponent)
