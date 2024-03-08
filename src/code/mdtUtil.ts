import { Drawing, MdtNote, MdtPolygon, MdtRoute, Route } from './types.ts'
import { MobSpawn, Point } from '../data/types.ts'
import { dungeonsByKey, dungeonsByMdtIdx } from '../data/dungeons.ts'
import { getPullColor } from './colors.ts'

const coordinateRatio = 2.185

const mdtPointToRoute = (x: number, y: number): Point => [y / coordinateRatio, x / coordinateRatio]
const pointToMdt = (point: Point): [number, number] => [
  point[1] * coordinateRatio,
  point[0] * coordinateRatio,
]

function mdtPolygonToDrawing(polygon: MdtPolygon): Drawing {
  const points: Point[] = []
  const chunkSize = 4
  for (let i = 0; i < polygon.l.length; i += chunkSize) {
    const [, , x, y] = polygon.l.slice(i, i + chunkSize) as [number, number, number, number]
    points.push(mdtPointToRoute(x, y))
  }

  return {
    weight: polygon.d[0],
    color: '#' + polygon.d[4],
    positions: points,
  }
}

function drawingToMdtPolygon(drawing: Drawing): MdtPolygon {
  const l: number[] = []
  const convertedPoints = drawing.positions.map(pointToMdt)
  let prevPoint: [number, number] | null = null
  for (const point of convertedPoints) {
    if (prevPoint) {
      l.push(prevPoint[0], prevPoint[1], point[0], point[1])
    }
    prevPoint = point
  }

  return {
    d: [drawing.weight, 1, 0, true, drawing.color, -8, true],
    l,
  }
}

export function mdtRouteToRoute(mdtRoute: MdtRoute): Route {
  const dungeon = dungeonsByMdtIdx[mdtRoute.value.currentDungeonIdx]
  if (!dungeon)
    throw new Error(`Could not find dungeon with MDT index ${mdtRoute.value.currentDungeonIdx}`)

  return {
    dungeonKey: dungeon.key,
    selectedPull: mdtRoute.value.currentPull,
    name: mdtRoute.text,
    uid: mdtRoute.uid,
    pulls: mdtRoute.value.pulls.map((mdtPull, index) => ({
      id: index,
      color: mdtPull.color.startsWith('#') ? mdtPull.color : `#${mdtPull.color}`,
      mobSpawns: Object.entries(mdtPull)
        .flatMap(([enemyIndexOrCount, spawnIndexes]) => {
          if (!Array.isArray(spawnIndexes)) return null

          const enemyIndex = Number(enemyIndexOrCount)
          return spawnIndexes.map((spawnIndex) => {
            const mob = dungeon.mdt.enemies.find((enemy) => enemy.enemyIndex == enemyIndex)
            if (!mob) {
              console.error(`Could not find enemy index ${enemyIndex} in pull ${index + 1}`)
              return null
            }

            const spawn = mob.spawns.find((spawn) => spawn.spawnIndex === spawnIndex)!
            return { mob, spawn }
          })
        })
        .filter(Boolean) as MobSpawn[],
    })),
    notes: mdtRoute.objects
      .filter((object): object is MdtNote => 'n' in object)
      .map((note) => ({ text: note.d[4], position: mdtPointToRoute(note.d[0], note.d[1]) })),
    drawings: mdtRoute.objects
      .filter((object): object is MdtPolygon => 'l' in object)
      .map(mdtPolygonToDrawing),
  }
}

function mobSpawnsToMdtEnemies(mobSpawns: MobSpawn[]) {
  return mobSpawns.reduce<Record<number, number[]>>((acc, mobSpawn) => {
    acc[mobSpawn.mob.enemyIndex] ??= []
    acc[mobSpawn.mob.enemyIndex]!.push(mobSpawn.spawn.spawnIndex)
    return acc
  }, {})
}

export function routeToMdtRoute(route: Route): MdtRoute {
  return {
    text: route.name,
    week: 1,
    difficulty: 2,
    uid: route.uid,
    value: {
      currentPull: route.selectedPull,
      currentSublevel: 1,
      currentDungeonIdx: dungeonsByKey[route.dungeonKey].mdt.dungeonIndex,
      selection: [],
      pulls: route.pulls.map((pull, index) => ({
        color: getPullColor(index),
        ...mobSpawnsToMdtEnemies(pull.mobSpawns),
      })),
    },
    objects: [...route.drawings.map(drawingToMdtPolygon)],
  }
}
