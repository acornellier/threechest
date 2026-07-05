# NPC portraits

Generates enemy portraits (`public/npc_portraits/<npcId>.png`). Run once per
season for the new dungeons. Requires running the game to render the portraits.

`npcId -> displayId` is read from the `MythicDungeonTools/` submodule, so there's
no external lookup — just keep the submodule up to date (`yarn dungeons` source).

## Setup (once)

- `pip install Pillow`
- Install the [WoWLua](https://www.curseforge.com/wow/addons/wowlua) addon
- In-game: `/console screenshotFormat tga`, and set Render Scale = 100%

## Steps

1. **Generate** — reads MDT, writes `run_ingame.lua` + `manifest.json`:
   ```bash
   cd scripts/npcPortraits
   python3 generate.py            # all dungeons, only missing portraits
   # python3 generate.py fang murd  # specific dungeon keys
   # python3 generate.py --all      # re-do existing ones too
   ```

2. **Render in-game** — open WoWLua (`/lua`), paste all of `run_ingame.lua`, Run.
   It renders a grid and auto-screenshots. Wait for `Done.` in chat. Don't take
   other screenshots meanwhile or press Alt-Z.

3. **Crop** — slices screenshots into `public/npc_portraits/`:
   ```bash
   python3 crop.py               # auto-detects your Screenshots folder
   # python3 crop.py --screenshots "/path/to/_ptr_/Screenshots"
   # python3 crop.py --dry-run     # preview only
   ```

4. **Commit** `public/npc_portraits`.

## Notes

- Resolution is auto-detected; nothing to calibrate.
- Portraits shifted/clipped → Render Scale isn't 100%.
- Can't find screenshots → pass `--screenshots` (PTR uses `_ptr_`, not `_retail_`).
- Wrong/blank portrait → stale displayId; update the submodule and re-run step 1.
- `run_ingame.lua` / `manifest.json` are git-ignored build artifacts.
