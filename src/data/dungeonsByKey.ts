import { Dungeon, DungeonKey } from './types.ts'
import { dotiu, eb } from './dungeons.ts'

export const dungeonsByKey: Record<DungeonKey, Dungeon> = {
  dotiu,
  eb,
}
