import { DungeonKey, WclDungeon } from '../types.ts'
import { ebWcl } from './ebWcl.ts'

export const wclDungeons: Record<DungeonKey, WclDungeon | null> = {
  aa: null,
  ad: null,
  bh: null,
  brh: null,
  dht: null,
  fall: null,
  eb: ebWcl,
  nok: null,
  rise: null,
  tott: null,
  wcm: null,
}
