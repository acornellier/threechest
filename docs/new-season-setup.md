# Setting up a new season

Each Mythic+ season swaps the pool of 8 dungeons. This is the end-to-end checklist
for migrating Threechest to a new dungeon set. Steps are ordered so that later steps
can rely on earlier ones (e.g. everything depends on the dungeon **keys** being set).

Throughout, `<key>` is the Threechest dungeon key: a short lowercase slug. Convention
is to reuse MDT's short name lowercased (e.g. `MurderRowShortName = "MURD"` → `murd`).

---

## 0. Update the MDT submodule

The `MythicDungeonTools/` submodule is the source of all game data (maps, mob spawns,
spells, coordinates). Update it to the version that ships the new season's dungeons.

```bash
cd MythicDungeonTools && git fetch && git checkout <tag-or-commit> && cd ..
```

Find each new dungeon's:
- **MDT texture folder** — `MythicDungeonTools/<Expansion>/Textures/<Folder>/` (150 PNGs).
- **MDT lua data file** — `MythicDungeonTools/<Expansion>/<Folder>.lua`.
- **Short name** — `MythicDungeonTools/Locales/enUS.lua`, the `*ShortName` entries.

## 1. Choose the 8 keys and wire up the dungeon list

Pick a `<key>` per dungeon, then update these files together:

- **`src/data/dungeonKeys.ts`** — replace the `dungeonKeys` array with the new keys.
- **`src/data/dungeons.ts`** — one entry per dungeon: `key`, `name`, `icon`, `wclEncounterId`.
  - `name` — display name (from enUS.lua).
  - `icon` — the WoW achievement icon slug. Search the dungeon on
    [Wowhead](https://www.wowhead.com/) and grab the icon name (e.g.
    `inv_achievement_dungeon_murderrow`).
  - `wclEncounterId` — the Warcraft Logs encounter id. Kept in the RPG backend at
    `../frontend_rpg/app/Constants/WarcraftEncounters.php` (~line 310).
- **`scripts/mdtDungeons.ts`** — update the `dungeonPaths` map: `<key>` → `<Expansion>/<Folder>`.
- **`src/store/routes/routesReducer.ts`** — update `defaultDungeonKey` if the previous
  default dungeon is gone.
- **`src/data/mdtDungeons.ts`** (loader) — swap the per-key JSON imports and the
  `mdtDungeonsFake` record to the new keys, and clear any stale `mdtPatches` entries.
  Note: `void` is a reserved word, so alias its import (e.g. `voidDungeon`). This file
  won't typecheck until step 3 generates the `*_mdt.json` files.
- **`src/data/sampleRoutes/sampleRoutesUncompiled.ts`** — replace the
  `sampleRouteDefinitions` record with the new keys (empty arrays unless you have curated
  MDT strings to seed); step 6's fetched routes are merged in on top.

## 2. Import the maps

Stitches each dungeon's 15×10 grid of 128px source PNGs into one image, then re-cuts a
6×4 grid of 320×320 JPGs (`<col>_<row>.jpg`) into `public/maps/<key>/`. Headless
ImageMagick replacement for the old GIMP `ofn-tiles-mdt.py` plugin.

```bash
./scripts/importMaps.sh
```

Edit the `MAPPINGS` array in `scripts/importMaps.sh` to the new `Folder:key` pairs first.
Requires ImageMagick (`brew install imagemagick`).

> Note: source tiles are currently **128px → 320px output** (older seasons used 256px →
> 640px). If tile resolution changes, review coordinate/size constants such as
> `src/util/map.ts` (`mapHeight` / `mapWidth`).

## 3. Generate dungeon data (mobs, spawns, POIs)

Parses each `.lua` into `src/data/mdtDungeons/<key>_mdt.json`.

```bash
yarn dungeons          # all dungeons
yarn dungeons <key>    # single dungeon (leaves the rest untouched)
```

## 4. Generate spell data

Extracts spell ids referenced by the dungeon mobs, writing
`src/data/spells/<key>/<key>_spells.json`. Depends on step 3's output.

```bash
yarn spells
```

## 5. Map coordinates

Two coordinate datasets under `src/data/coordinates/` need per-dungeon values. Both files
contain step-by-step instructions in their header comments.

### 5a. Map bounds (`mapBoundsUncompiled.ts` → `mapBounds.ts`)
1. Copy the new `uimapassignment.json` from Grimoire into `src/data/coordinates/`.
2. Look up each dungeon on [wago.tools/db2/Map](https://wago.tools/db2/Map) and add its
   Map ID to the `mapIds` array (comment each with its `<key>`).
3. Compile: `yarn tsx ./scripts/buildMapBounds.ts`

### 5b. MDT map offsets (`mdtMapOffsets.ts`)
For each dungeon UiMapID, align the MDT map to the original WoW map (rotation/scale/translate):
1. In [Photopea](https://www.photopea.com/), open the MDT map.
2. Overlay the original WoW map from [wago.tools/maps/worldmap](https://wago.tools/maps/worldmap)
   (its id is the object key), opacity 50%.
3. Rotate (if needed), scale, and translate to match; then read W/H/X/Y from layer properties.

## 6. Fetch sample / top routes from Warcraft Logs

Requires the API server env (WCL OAuth) configured. Reads `wclEncounterId` from
`dungeons.ts`, writes to `src/data/sampleRoutes/<key>/`.

```bash
yarn r                 # all dungeons (shuffled)
yarn r <key>           # single dungeon
yarn r --reset         # ignore the WCL cache
yarn r --recalc        # recompute routes from cached fights
```

## 7. Clean up the previous season

Remove data for dungeons no longer in the pool:
- `public/maps/<old-key>/`
- `src/data/mdtDungeons/<old-key>_mdt.json`
- `src/data/sampleRoutes/<old-key>/`
- old entries in `mapIds` / `mdtMapOffsets` / spell data
- any lingering references to old keys

## 8. Verify

```bash
yarn lint
yarn build
yarn dev   # + yarn server + yarn rtc — click through each dungeon map, mobs, and sample routes
```

---

## Quick reference: files touched per season

| Concern | File(s) | How |
|---|---|---|
| Keys | `src/data/dungeonKeys.ts` | manual |
| Dungeon list | `src/data/dungeons.ts` | manual (name/icon/wclEncounterId) |
| MDT paths | `scripts/mdtDungeons.ts` (`dungeonPaths`) | manual |
| Default dungeon | `src/store/routes/routesReducer.ts` | manual |
| MDT data loader | `src/data/mdtDungeons.ts` (imports + `mdtDungeonsFake`) | manual |
| Sample route defs | `src/data/sampleRoutes/sampleRoutesUncompiled.ts` | manual |
| Maps | `public/maps/<key>/` | `./scripts/importMaps.sh` |
| Mobs/spawns/POIs | `src/data/mdtDungeons/*.json` | `yarn dungeons` |
| Spells | `src/data/spells/<key>/` | `yarn spells` |
| Map bounds | `src/data/coordinates/mapBounds*.ts`, `uimapassignment.json` | Grimoire + `buildMapBounds.ts` |
| Map offsets | `src/data/coordinates/mdtMapOffsets.ts` | Photopea, manual |
| Sample routes | `src/data/sampleRoutes/*` | `yarn r` |
