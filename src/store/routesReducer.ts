import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MdtRoute, Note, Pull, Route, SavedRoute } from '../util/types.ts'
import { DungeonKey, SpawnId } from '../data/types.ts'
import { mdtRouteToRoute } from '../util/mdtUtil.ts'
import undoable, { combineFilters, excludeAction, includeAction } from 'redux-undo'
import { addPullFunc, boxSelectSpawnsAction, toggleSpawnAction } from './actions.ts'
import * as localforage from 'localforage'
import { RootState } from './store.ts'
import { persistReducer } from 'redux-persist'
import { indexedDbStorage } from './storage.ts'
import { routeMigrate, routePersistVersion } from './routeMigrations.ts'
import { joinMobSpawns } from '../util/mobSpawns.ts'

export interface RouteState {
  route: Route
  savedRoutes: SavedRoute[]
}

const emptyPull = { id: 0, spawns: [], tempSpawns: [] }

const newRouteUid = () => Math.random().toString(36).slice(2)

function nextName(routeName: string, dungeonKey: DungeonKey, savedRoutes: SavedRoute[]) {
  const match = routeName.match(/(.*\s)(\d+)$/)
  const baseName = match?.[1] ?? routeName
  const defaultNamesRoutes = savedRoutes.filter(
    (route) => route.dungeonKey === dungeonKey && route.name.startsWith(baseName),
  )
  if (!defaultNamesRoutes.length) return routeName

  const numbers = defaultNamesRoutes.map((route) => route.name.split(baseName)[1]).map(Number)
  const maxNumber = numbers.reduce((acc, cur) => (cur > acc ? cur : acc), 0)
  return baseName + ' ' + (maxNumber + 1).toString()
}

const makeEmptyRoute = (dungeonKey: DungeonKey, savedRoutes: SavedRoute[]): Route => ({
  name: nextName('Awesome route', dungeonKey, savedRoutes),
  dungeonKey,
  selectedPull: 0,
  pulls: [emptyPull],
  drawings: [],
  notes: [],
  uid: newRouteUid(),
})

const savedRouteKey = 'savedRoute'
export const getSavedRouteKey = (routeId: string) => [savedRouteKey, routeId].join('-')
async function loadRouteFromStorage(routeId: string) {
  const route = await localforage.getItem<Route>(getSavedRouteKey(routeId))
  if (route === null) {
    throw new Error(`Could not load route ${routeId}`)
  }

  return route
}

export const loadRoute = createAsyncThunk('routes/loadRoute', loadRouteFromStorage)

export const getLastDungeonRoute = async (dungeonKey: DungeonKey, savedRoutes: SavedRoute[]) => {
  // This can be called from the Error handler, so we want to handle the cases where dungeonKey is nullish
  const dungeonRoutes = savedRoutes.filter((route) =>
    dungeonKey ? route.dungeonKey === dungeonKey : true,
  )
  if (dungeonRoutes.length) {
    return await loadRouteFromStorage(dungeonRoutes[dungeonRoutes.length - 1]!.uid)
  } else {
    return makeEmptyRoute(dungeonKey, savedRoutes)
  }
}

export const setDungeon = createAsyncThunk(
  'routes/setDungeon',
  async (dungeonKey: DungeonKey, thunkAPI) => {
    const state = thunkAPI.getState() as RootState
    return await getLastDungeonRoute(dungeonKey, state.routes.present.savedRoutes)
  },
)

export const deleteRoute = createAsyncThunk('routes/deleteRoute', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootState
  const routeId = state.routes.present.route.uid
  await localforage.removeItem(getSavedRouteKey(routeId))

  const savedRoutes = state.routes.present.savedRoutes.filter((route) => route.uid !== routeId)
  const route = await getLastDungeonRoute(state.routes.present.route.dungeonKey, savedRoutes)
  return { deletedRouteId: routeId, route }
})

export const defaultDungeonKey = 'eb'

export const initialState: RouteState = {
  route: makeEmptyRoute(defaultDungeonKey, []),
  savedRoutes: [],
}

const baseReducer = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    updateSavedRoutes(state) {
      const savedRoute = state.savedRoutes.find((route) => route.uid === state.route.uid)
      if (!savedRoute) {
        state.savedRoutes.push({
          uid: state.route.uid,
          name: state.route.name,
          dungeonKey: state.route.dungeonKey,
        })
      } else if (savedRoute.name !== state.route.name) {
        savedRoute.name = state.route.name
      }
    },
    newRoute(state, { payload: dungeonKey }: PayloadAction<DungeonKey | undefined>) {
      state.route = makeEmptyRoute(dungeonKey ?? state.route.dungeonKey, state.savedRoutes)
    },
    duplicateRoute(state) {
      state.route.uid = newRouteUid()
      state.route.name = nextName(state.route.name, state.route.dungeonKey, state.savedRoutes)
    },
    setRouteFromMdt(
      state,
      { payload: { mdtRoute, copy } }: PayloadAction<{ mdtRoute: MdtRoute; copy: boolean }>,
    ) {
      const route = mdtRouteToRoute(mdtRoute)
      if (copy) {
        route.uid = newRouteUid()
        route.name = nextName(route.name, route.dungeonKey, state.savedRoutes)
      }

      state.route = route
    },
    clearRoute(state) {
      state.route.pulls = [emptyPull]
      state.route.selectedPull = 0
      state.route.drawings = []
    },
    setName(state, { payload }: PayloadAction<string>) {
      state.route.name = payload
    },
    addPull(state, { payload = state.route.pulls.length }: PayloadAction<number | undefined>) {
      addPullFunc(state, payload)
    },
    prependPull(state) {
      addPullFunc(state, state.route.selectedPull)
    },
    appendPull(state) {
      addPullFunc(state, state.route.selectedPull + 1)
    },
    clearPull(state, { payload: pullIndex }: PayloadAction<number | undefined>) {
      const pull = state.route.pulls[pullIndex ?? state.route.selectedPull]
      if (pull) pull.spawns = []
    },
    deletePull(
      state,
      {
        payload: { pullIndex, moveUp },
      }: PayloadAction<{ pullIndex?: number | undefined; moveUp?: boolean }>,
    ) {
      state.route.pulls.splice(pullIndex ?? state.route.selectedPull, 1)

      if (state.route.pulls.length === 0) state.route.pulls = [emptyPull]

      if (moveUp || state.route.selectedPull >= state.route.pulls.length) {
        state.route.selectedPull = Math.max(0, state.route.selectedPull - 1)
      }
    },
    selectPull(state, { payload }: PayloadAction<number>) {
      state.route.selectedPull = Math.max(0, Math.min(payload, state.route.pulls.length - 1))
    },
    selectPullRelative(state, { payload }: PayloadAction<number>) {
      const newIndex = state.route.selectedPull + payload
      if (newIndex >= 0 && newIndex < state.route.pulls.length) {
        state.route.selectedPull = newIndex
      }
    },
    toggleSpawn(state, { payload }: PayloadAction<{ spawn: SpawnId; individual: boolean }>) {
      state.route.pulls = toggleSpawnAction(state.route, payload)
    },
    boxSelectSpawns(state, { payload }: PayloadAction<SpawnId[]>) {
      boxSelectSpawnsAction(state.route, payload)
    },
    commitBoxSelect(state) {
      const pull = state.route.pulls[state.route.selectedPull]
      if (!pull) return

      pull.spawns = joinMobSpawns(pull.spawns, pull.tempSpawns)
      pull.tempSpawns = []
    },
    setPulls(state, { payload }: PayloadAction<Pull[]>) {
      state.route.pulls = payload
    },
    addNote(state, { payload: note }: PayloadAction<Note>) {
      state.route.notes.push({ ...note, justAdded: true })
    },
    editNote(
      state,
      {
        payload: { changes, noteIndex },
      }: PayloadAction<{ changes: Partial<Note>; noteIndex: number }>,
    ) {
      state.route.notes[noteIndex] = { ...state.route.notes[noteIndex]!, ...changes }
    },
    deleteNote(state, { payload: noteIndex }: PayloadAction<number>) {
      state.route.notes.splice(noteIndex, 1)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setDungeon.fulfilled, (state, { payload: newRoute }) => {
      state.route = newRoute
    })

    builder.addCase(loadRoute.fulfilled, (state, { payload: newRoute }) => {
      state.route = newRoute
    })

    builder.addCase(
      deleteRoute.fulfilled,
      (state, { payload: { deletedRouteId, route: newRoute } }) => {
        state.savedRoutes = state.savedRoutes.filter((route) => route.uid !== deletedRouteId)
        state.route = newRoute
      },
    )
  },
})

const undoableReducer = undoable(baseReducer.reducer, {
  limit: 100,
  filter: combineFilters(
    includeAction([
      baseReducer.actions.newRoute.type,
      baseReducer.actions.clearRoute.type,
      baseReducer.actions.addPull.type,
      baseReducer.actions.prependPull.type,
      baseReducer.actions.appendPull.type,
      baseReducer.actions.clearPull.type,
      baseReducer.actions.deletePull.type,
      baseReducer.actions.toggleSpawn.type,
      baseReducer.actions.commitBoxSelect.type,
      baseReducer.actions.setPulls.type,
      // baseReducer.actions.addNote.type, // intentionally leave out for justAdded hack
      baseReducer.actions.editNote.type,
      baseReducer.actions.deleteNote.type,
    ]),
    excludeAction(['persist/PERSIST', 'persist/REHYDRATE']),
  ),
})

const persistedReducer = persistReducer(
  {
    key: 'routesReducer',
    storage: indexedDbStorage,
    version: routePersistVersion,
    migrate: routeMigrate,
    serialize: false,
    deserialize: false,
  },
  undoableReducer,
)

export const routesReducer = persistedReducer

export const {
  updateSavedRoutes,
  newRoute,
  duplicateRoute,
  setRouteFromMdt,
  clearRoute,
  setName,
  addPull,
  appendPull,
  prependPull,
  clearPull,
  deletePull,
  selectPull,
  selectPullRelative,
  toggleSpawn,
  boxSelectSpawns,
  commitBoxSelect,
  setPulls,
  addNote,
  editNote,
  deleteNote,
} = baseReducer.actions
