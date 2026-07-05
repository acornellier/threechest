// Season 1 dungeon data, snapshotted for the wclCalc regression tests.
//
// These tests exercise season-independent wclCalc logic, but each was captured against a
// real Season 1 fight (see the wclRoute-*.json fixtures). When S1 was removed from the app,
// its mdt mob-spawn data went with it — so the `*_mdt.json` files here are recovered copies
// (from git, commit before "new dungeons are up!") kept solely to feed those tests.
//
// Keyed by WCL encounter id so a fixture resolves the same way the app would, then injected
// into wclResultToRoute's optional `dungeon` param.

import type { Dungeon, MdtDungeon, MdtDungeonFake } from '../../data/types.ts'
import type { DungeonKey } from '../../data/dungeonKeys.ts'
import { mdtEnemiesToMobSpawns } from '../mobSpawns.ts'
import magi from './s1mdt/magi_mdt.json'
import cavns from './s1mdt/cavns_mdt.json'
import wind from './s1mdt/wind_mdt.json'
import pit from './s1mdt/pit_mdt.json'

interface S1DungeonMeta {
  key: string
  name: string
  icon: string
  wclEncounterId: number
  mdt: MdtDungeonFake
}

const s1Meta: S1DungeonMeta[] = [
  { key: 'magi', name: "Magisters' Terrace", icon: '', wclEncounterId: 12811, mdt: magi },
  { key: 'cavns', name: 'Maisara Caverns', icon: '', wclEncounterId: 12874, mdt: cavns },
  { key: 'wind', name: 'Windrunner Spire', icon: '', wclEncounterId: 12805, mdt: wind },
  { key: 'pit', name: 'Pit of Saron', icon: '', wclEncounterId: 10658, mdt: pit },
]

function buildDungeon({ key, name, icon, wclEncounterId, mdt }: S1DungeonMeta): Dungeon {
  const mdtDungeon = mdt as MdtDungeon
  const mobSpawns = mdtEnemiesToMobSpawns(mdtDungeon.enemies)
  return {
    key: key as DungeonKey, // S1 keys are no longer in DungeonKey; test-only cast
    name,
    icon,
    wclEncounterId,
    mdt: mdtDungeon,
    mobSpawns,
    mobSpawnsList: Object.values(mobSpawns),
  }
}

// encounter id -> Dungeon
export const s1Dungeons: Record<number, Dungeon> = Object.fromEntries(
  s1Meta.map((meta) => [meta.wclEncounterId, buildDungeon(meta)]),
)
