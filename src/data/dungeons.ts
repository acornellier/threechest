import { Dungeon, DungeonKey } from './types.ts'
import { vp } from './vp.ts'

export const dungeonsByKey: Record<DungeonKey, Dungeon> = {
  vp,
}
