# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

**Threechest** is a Mythic+ dungeon route planning web app for World of Warcraft. Players use it to build, share, and collaborate on pull-by-pull routes through Mythic+ dungeons. Routes can be imported from MythicDungeonTools (MDT), a popular WoW addon, and top routes can be fetched from Warcraft Logs.

## Commands

```bash
yarn dev          # Vite dev server (frontend only, port 5173)
yarn server       # Express API server (backend, required for WCL and encode/decode)
yarn rtc          # WebSocket signaling server (required for real-time collaboration)
yarn build        # tsc + vite build (client + Vercel server bundle)
yarn lint         # ESLint with --max-warnings 0 (zero tolerance)

# Data generation scripts (run occasionally to refresh game data)
yarn dungeons     # Parse MDT Lua submodule → src/data/mdtDungeons/*.json
yarn r            # Fetch top WCL routes → src/data/sampleRoutes/
yarn spells       # Extract spell IDs from dungeon data
```

Full local dev requires all three servers (`dev`, `server`, `rtc`) running concurrently.

## Architecture

### Frontend (src/)

React + Redux SPA. The Redux store is the single source of truth for all route data:

- **`src/util/types.ts`** — Core domain types: `Route`, `Pull`, `Drawing`, `Note`, `Assignments`. A `Route` has a `dungeonKey`, an ordered list of `Pull`s (each containing `SpawnId[]`), and drawings/notes/assignments.
- **`src/data/types.ts`** — Static game data types: `Dungeon`, `Mob`, `MobSpawn`, `Spawn`, `Spell`. These are immutable reference data loaded at startup.
- **`src/store/routes/`** — Primary Redux slice. `routesReducer.ts` holds active route + savedRoutes list. Routes persist to IndexedDB via redux-persist + localforage. The routes slice is wrapped in `redux-undo`.
- **`src/store/listener.ts`** — Side-effect middleware (listenerMiddleware). Async reactions to Redux actions live here.
- **`src/components/Map/`** — Leaflet-based dungeon map. Renders mob spawns, pull numbers, drawings, and annotations as Leaflet layers.
- **`src/components/Sidebar/`** — Pull list, mob details, route management.
- **`src/components/Collab/`** — Real-time collaboration UI (Yjs awareness state, peer presence).
- **`src/util/mdtUtil.ts`** — Encode/decode routes to/from MDT string format (the shareable string used by the WoW addon).
- **`src/util/wclCalc.ts`** — Parses raw Warcraft Logs fight events into a `Route`.

### Data pipeline

```
MythicDungeonTools/ (git submodule, Lua)
    ↓  yarn dungeons
src/data/mdtDungeons/*.json   ← static game data bundled into the app
src/data/sampleRoutes/*.ts    ← top WCL routes (fetched by yarn r)
```

`SpawnId` strings (e.g. `"12-3"`) identify individual mob spawns: `enemyIndex-spawnIndex`. These are the atomic units stored in `Pull.spawns`.

### Backend (server/)

Express server with three routes:
- `POST /api/decodeRoute` — decompress MDT string → `MdtRoute` JSON
- `POST /api/encodeRoute` — `MdtRoute` JSON → MDT string
- `POST /api/wclRoute` — fetch a specific WCL fight and return a parsed `Route`

WCL OAuth tokens are cached in `server/cache/`. Dungeon rankings cache is also stored there.

### Real-time collaboration (rtc-server/)

Standalone WebSocket server. Implements topic-based pub/sub for WebRTC signaling. Clients use Yjs CRDTs for conflict-free merging of route edits; the RTC server only brokers the peer connections.

### Deployment

Deployed on Vercel. `vite.config.vercelServer.ts` bundles the Express server as Vercel serverless functions. `vercel.json` routes `/api/*` to the server bundle. The RTC server deploys separately.

## Key conventions

- **`Point` is `[y, x]`** (not `[x, y]`) — this matches Leaflet's coordinate system.
- Game data types (`Dungeon`, `Mob`, etc.) live in `src/data/types.ts`; route/user-created types (`Route`, `Pull`, etc.) live in `src/util/types.ts`.
- `MobFake` / `SpawnFake` / `MdtDungeonFake` types exist only to accept raw JSON (where tuples are typed as `number[]`); cast to the real types after loading.
- ESLint is strict (`max-warnings 0`). Run `yarn lint` before committing.
- No test suite — correctness is verified manually and via TypeScript.
