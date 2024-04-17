import type { Dungeon } from './types.ts'
import { mdtDungeons, mdtMobSpawns } from './mdtDungeons.ts'
import { mapHeight, mapWidth } from '../util/map.ts'
import type { DungeonKey } from './dungeonKeys.ts'

export const dungeonData = (
  key: DungeonKey,
): Pick<Dungeon, 'mdt' | 'mobSpawns' | 'mobSpawnsList'> => ({
  mdt: mdtDungeons[key],
  mobSpawns: mdtMobSpawns[key],
  mobSpawnsList: Object.values(mdtMobSpawns[key]),
})

const aa: Dungeon = {
  name: 'Algethar Academy',
  key: 'aa',
  icon: 'achievement_dungeon_dragonacademy',
  defaultBounds: [
    [10, 0],
    [-mapHeight, mapWidth],
  ],
  ...dungeonData('aa'),
}

const av: Dungeon = {
  name: 'Azure Vault',
  key: 'av',
  icon: 'achievement_dungeon_arcanevaults',
  ...dungeonData('av'),
}

const bh: Dungeon = {
  name: 'Brackenhide Hollow',
  key: 'bh',
  icon: 'achievement_dungeon_brackenhidehollow',
  ...dungeonData('bh'),
}

const hoi: Dungeon = {
  name: 'Halls of Infusion',
  key: 'hoi',
  icon: 'achievement_dungeon_hallsofinfusion',
  ...dungeonData('hoi'),
}

const nelth: Dungeon = {
  name: 'Neltharus',
  key: 'nelth',
  icon: 'achievement_dungeon_neltharus',
  ...dungeonData('nelth'),
}

const nok: Dungeon = {
  name: 'Nokhud Offensive',
  key: 'nok',
  icon: 'achievement_dungeon_centaurplains',
  ...dungeonData('nok'),
}

const rlp: Dungeon = {
  name: 'Ruby Life Pools',
  key: 'rlp',
  icon: 'achievement_dungeon_lifepools',
  defaultBounds: [
    [10, 0],
    [-mapHeight, mapWidth],
  ],
  ...dungeonData('rlp'),
}

const uld: Dungeon = {
  name: 'Uldaman',
  key: 'uld',
  icon: 'achievement_dungeon_uldaman',
  ...dungeonData('uld'),
}

const ad: Dungeon = {
  name: "Atal'Dazar",
  key: 'ad',
  defaultBounds: [
    [0, 110],
    [-240, 330],
  ],
  icon: 'achievement_dungeon_ataldazar',
  ...dungeonData('ad'),
}

const brh: Dungeon = {
  name: 'Black Rook Hold',
  key: 'brh',
  icon: 'achievement_dungeon_blackrookhold',
  ...dungeonData('brh'),
}

const dht: Dungeon = {
  name: 'Darkheart Thicket',
  key: 'dht',
  defaultBounds: [
    [-20, 46],
    [-242, 346],
  ],
  icon: 'achievement_dungeon_darkheartthicket',
  ...dungeonData('dht'),
}

const eb: Dungeon = {
  name: 'Everbloom',
  key: 'eb',
  defaultBounds: [
    [-40, 180],
    [-180, 300],
  ],
  icon: 'achievement_dungeon_everbloom',
  ...dungeonData('eb'),
}

const fall: Dungeon = {
  name: 'DOTI: Fall of Galakrond',
  key: 'fall',
  defaultBounds: [
    [-10, 50],
    [-mapHeight, 350],
  ],
  icon: 'achievement_dungeon_dawnoftheinfinite',
  ...dungeonData('fall'),
}

const rise: Dungeon = {
  name: "DOTI: Murozond's Rise",
  key: 'rise',
  defaultBounds: [
    [-10, 50],
    [-mapHeight, 350],
  ],
  icon: 'achievement_dungeon_dawnoftheinfinite',
  ...dungeonData('rise'),
}

const tott: Dungeon = {
  name: 'Throne of the Tides',
  key: 'tott',
  defaultBounds: [
    [-20, 50],
    [-230, 340],
  ],
  icon: 'achievement_dungeon_throne-of-the-tides',
  ...dungeonData('tott'),
}

const wcm: Dungeon = {
  name: 'Waycrest Manor',
  key: 'wcm',
  icon: 'achievement_dungeon_waycrestmannor',
  ...dungeonData('wcm'),
}

export const dungeons = [
  aa,
  av,
  ad,
  bh,
  hoi,
  nelth,
  nok,
  rlp,
  uld,
  brh,
  dht,
  fall,
  rise,
  eb,
  tott,
  wcm,
]

export const dungeonsByKey = dungeons.reduce(
  (acc, dungeon) => {
    acc[dungeon.key] = dungeon
    return acc
  },
  {} as Record<DungeonKey, Dungeon>,
)

export const dungeonsByMdtIdx = dungeons.reduce(
  (acc, dungeon) => {
    acc[dungeon.mdt.dungeonIndex] = dungeon
    return acc
  },
  {} as Record<number, Dungeon>,
)
