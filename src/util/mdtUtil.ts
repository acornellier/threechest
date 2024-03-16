import { Drawing, MdtArrow, MdtNote, MdtPolygon, MdtRoute, Note, Route } from './types.ts'
import { Dungeon, Point, SpawnId } from '../data/types.ts'
import { dungeonsByKey, dungeonsByMdtIdx } from '../data/dungeons.ts'
import { getPullColor } from './colors.ts'
import { equalPoints } from './map.ts'
import { findMobSpawn } from './mobSpawns.ts'

const coordinateRatio = 2.185

const mdtPointToRoute = (x: number, y: number): Point => [y / coordinateRatio, x / coordinateRatio]
const pointToMdt = (point: Point): [number, number] => [
  point[1] * coordinateRatio,
  point[0] * coordinateRatio,
]

function noteToMdt(note: Note): MdtNote {
  const mdtPos = pointToMdt(note.position)
  return {
    d: [mdtPos[0], mdtPos[1], 1, true, note.text],
    n: true,
  }
}

function mdtPolygonToDrawing(polygon: MdtPolygon | MdtArrow): Drawing {
  const convertedPoints: Point[] = []
  for (let i = 0; i < polygon.l.length; i += 2) {
    const [x, y] = polygon.l.slice(i, i + 2).map(Number) as [number, number]
    convertedPoints.push(mdtPointToRoute(x, y))
  }

  const polylines: Point[][] = []
  let prevPoint: Point | null = null
  let curPolyline: Point[] = []
  for (let i = 0; i < convertedPoints.length - 1; i += 2) {
    const point1 = convertedPoints[i]!
    const point2 = convertedPoints[i + 1]!

    if (!prevPoint || !equalPoints(point1, prevPoint)) {
      if (prevPoint) {
        polylines.push(curPolyline)
        curPolyline = []
      }
      curPolyline.push(point1)
    }

    curPolyline.push(point2)
    prevPoint = point2
  }

  polylines.push(curPolyline)

  return {
    weight: polygon.d[0],
    color: '#' + polygon.d[4],
    positions: polylines,
    ...('t' in polygon ? { arrowRotation: polygon.t[0] } : {}),
  }
}

function drawingToMdtPolygon(drawing: Drawing): MdtPolygon | MdtArrow {
  const l: number[] = []
  const convertedLines = drawing.positions.map((line) => line.map(pointToMdt))

  let prevPoint: [number, number] | null = null
  for (const line of convertedLines) {
    for (const point of line) {
      if (prevPoint) {
        l.push(prevPoint[0], prevPoint[1], point[0], point[1])
      }
      prevPoint = point
    }
    prevPoint = null
  }

  if (drawing.arrowRotation) {
    return {
      d: [drawing.weight, 1, 1, true, drawing.color.slice(1), -8],
      l: l.map(String),
      t: [drawing.arrowRotation],
    }
  } else {
    return {
      d: [drawing.weight, 1, 1, true, drawing.color.slice(1), -8, true],
      l: l.map(String),
    }
  }
}

export function mdtRouteToRoute(mdtRoute: MdtRoute): Route {
  const dungeon = dungeonsByMdtIdx[mdtRoute.value.currentDungeonIdx]
  if (!dungeon)
    throw new Error(`Could not find dungeon with MDT index ${mdtRoute.value.currentDungeonIdx}`)

  const mdtObjects = Array.isArray(mdtRoute.objects)
    ? mdtRoute.objects
    : Object.values(mdtRoute.objects)

  return {
    dungeonKey: dungeon.key,
    selectedPull: mdtRoute.value.currentPull,
    name: mdtRoute.text,
    uid: mdtRoute.uid,
    pulls: mdtRoute.value.pulls.map((mdtPull, index) => ({
      id: index,
      spawnsBackup: [],
      spawns: Object.entries(mdtPull)
        .flatMap(([enemyIndexOrCount, spawnIndexes]) => {
          if (!Array.isArray(spawnIndexes)) return null

          const enemyIndex = Number(enemyIndexOrCount)
          return spawnIndexes.map((spawnIndex) => {
            const mobSpawn = Object.values(dungeon.mobSpawns).find(
              ({ mob, spawn }) => mob.enemyIndex == enemyIndex && spawn.spawnIndex === spawnIndex,
            )

            if (!mobSpawn) {
              console.error(`Could not find enemy index ${enemyIndex} in pull ${index + 1}`)
              return null
            }

            return mobSpawn.spawn.id
          })
        })
        .filter(Boolean) as SpawnId[],
    })),
    notes: mdtObjects
      .filter((object): object is MdtNote => 'n' in object)
      .map((note) => ({ text: note.d[4], position: mdtPointToRoute(note.d[0], note.d[1]) })),
    drawings: mdtObjects
      .filter((object): object is MdtPolygon | MdtArrow => 'l' in object)
      .map(mdtPolygonToDrawing),
  }
}

function mobSpawnsToMdtEnemies(spawns: SpawnId[], dungeon: Dungeon) {
  return spawns.reduce<Record<number, number[]>>((acc, spawn) => {
    const mobSpawn = findMobSpawn(spawn, dungeon)
    acc[mobSpawn.mob.enemyIndex] ??= []
    acc[mobSpawn.mob.enemyIndex]!.push(mobSpawn.spawn.spawnIndex)
    return acc
  }, {})
}

export function routeToMdtRoute(route: Route): MdtRoute {
  const dungeon = dungeonsByKey[route.dungeonKey]
  return {
    text: route.name,
    week: 1,
    difficulty: 2,
    uid: route.uid,
    value: {
      currentPull: route.selectedPull,
      currentSublevel: 1,
      currentDungeonIdx: dungeon.mdt.dungeonIndex,
      selection: [],
      pulls: route.pulls.map((pull, index) => ({
        color: getPullColor(index),
        ...mobSpawnsToMdtEnemies(pull.spawns, dungeon),
      })),
    },
    objects: [...route.notes.map(noteToMdt), ...route.drawings.map(drawingToMdtPolygon)],
  }
}
