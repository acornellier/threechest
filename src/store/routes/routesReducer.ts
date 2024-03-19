import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { MdtRoute, Note, Pull, Route, SavedRoute } from '../../util/types.ts'
import { DungeonKey, SpawnId } from '../../data/types.ts'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'
import undoable, { combineFilters, excludeAction, includeAction } from 'redux-undo'
import { addPullFunc, boxSelectSpawnsAction, toggleSpawnAction } from './routeActions.ts'
import * as localforage from 'localforage'
import { RootState } from '../store.ts'
import { persistReducer } from 'redux-persist'
import { indexedDbStorage } from '../storage.ts'
import { routeMigrate, routePersistVersion } from './routeMigrations.ts'

export interface RouteState {
  route: Route
  selectedPull: number
  savedRoutes: SavedRoute[]
}

const emptyPull: Pull = { id: 0, spawns: [] }

export const newRouteUid = () => Math.random().toString(36).slice(2)

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
  name: nextName('Default threechest.io', dungeonKey, savedRoutes),
  dungeonKey,
  pulls: [emptyPull],
  drawings: [],
  notes: [],
  uid: newRouteUid(),
})

const savedRouteKey = 'savedRoute'
export const getSavedRouteKey = (routeId: string) => [savedRouteKey, routeId].join('-')
export async function loadRouteFromStorage(routeId: string) {
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
  selectedPull: 0,
  savedRoutes: [],
}

function setRouteFresh(state: RouteState, route: Route) {
  state.route = route
  state.selectedPull = 0
}

const baseReducer = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setRoute(state, { payload: route }: PayloadAction<Route>) {
      setRouteFresh(state, route)
    },
    newRoute(state, { payload: dungeonKey }: PayloadAction<DungeonKey | undefined>) {
      const route = makeEmptyRoute(dungeonKey ?? state.route.dungeonKey, state.savedRoutes)
      setRouteFresh(state, route)
    },
    duplicateRoute(state) {
      state.route.uid = newRouteUid()
      state.route.name = nextName(state.route.name, state.route.dungeonKey, state.savedRoutes)
    },
    setRouteFromMdt(
      state,
      { payload: { mdtRoute, copy } }: PayloadAction<{ mdtRoute: MdtRoute; copy?: boolean }>,
    ) {
      const route = mdtRouteToRoute(mdtRoute)
      if (copy) {
        route.uid = newRouteUid()
        route.name = nextName(route.name, route.dungeonKey, state.savedRoutes)
      }

      setRouteFresh(state, route)
    },
    clearRoute(state) {
      state.route.pulls = [emptyPull]
      state.route.drawings = []
      state.route.notes = []
      state.selectedPull = 0
    },
    setName(state, { payload }: PayloadAction<string>) {
      state.route.name = payload
    },
    addPull(state, { payload = state.route.pulls.length }: PayloadAction<number | undefined>) {
      addPullFunc(state, payload)
    },
    prependPull(state) {
      addPullFunc(state, state.selectedPull)
    },
    appendPull(state) {
      addPullFunc(state, state.selectedPull + 1)
    },
    clearPull(state, { payload: pullIndex }: PayloadAction<number | undefined>) {
      const pull = state.route.pulls[pullIndex ?? state.selectedPull]
      if (pull) pull.spawns = []
    },
    deletePull(
      state,
      {
        payload: { pullIndex, moveUp },
      }: PayloadAction<{ pullIndex?: number | undefined; moveUp?: boolean }>,
    ) {
      state.route.pulls.splice(pullIndex ?? state.selectedPull, 1)

      if (state.route.pulls.length === 0) state.route.pulls = [emptyPull]

      if (moveUp || state.selectedPull >= state.route.pulls.length) {
        state.selectedPull = Math.max(0, state.selectedPull - 1)
      }
    },
    selectPull(state, { payload }: PayloadAction<number>) {
      state.selectedPull = Math.max(0, Math.min(payload, state.route.pulls.length - 1))
    },
    selectPullRelative(state, { payload }: PayloadAction<number>) {
      const newIndex = state.selectedPull + payload
      if (newIndex >= 0 && newIndex < state.route.pulls.length) {
        state.selectedPull = newIndex
      }
    },
    toggleSpawn(state, { payload }: PayloadAction<{ spawn: SpawnId; individual: boolean }>) {
      state.route.pulls = toggleSpawnAction(state, payload)
    },
    boxSelectStart(state) {
      const pull = state.route.pulls[state.selectedPull]
      if (pull) pull.spawnsBackup = pull.spawns
    },
    boxSelectSpawns(
      state,
      { payload: { spawns, inverse } }: PayloadAction<{ spawns: SpawnId[]; inverse: boolean }>,
    ) {
      boxSelectSpawnsAction(state, spawns, inverse)
    },
    boxSelectEnd(state) {
      const pull = state.route.pulls[state.selectedPull]
      if (pull) delete pull.spawnsBackup
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
    moveNote(
      state,
      {
        payload: { noteIndex, indexChange },
      }: PayloadAction<{ noteIndex: number; indexChange: number }>,
    ) {
      const newIndex = noteIndex + indexChange
      const noteToMove = state.route.notes[noteIndex]
      const noteToSwap = state.route.notes[newIndex]
      if (!noteToMove || !noteToSwap) return

      state.route.notes[noteIndex] = noteToSwap
      state.route.notes[newIndex] = noteToMove
    },
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
  },
  extraReducers: (builder) => {
    builder.addCase(setDungeon.fulfilled, (state, { payload: route }) => {
      setRouteFresh(state, route)
    })

    builder.addCase(loadRoute.fulfilled, (state, { payload: route }) => {
      setRouteFresh(state, route)
    })

    builder.addCase(deleteRoute.fulfilled, (state, { payload: { deletedRouteId, route } }) => {
      state.savedRoutes = state.savedRoutes.filter(
        (savedRoute) => savedRoute.uid !== deletedRouteId,
      )
      setRouteFresh(state, route)
    })
  },
})

const undoableReducer = undoable(baseReducer.reducer, {
  limit: 100,
  filter: combineFilters(
    includeAction([
      baseReducer.actions.setRoute.type,
      baseReducer.actions.newRoute.type,
      baseReducer.actions.clearRoute.type,
      baseReducer.actions.addPull.type,
      baseReducer.actions.prependPull.type,
      baseReducer.actions.appendPull.type,
      baseReducer.actions.clearPull.type,
      baseReducer.actions.deletePull.type,
      baseReducer.actions.toggleSpawn.type,
      baseReducer.actions.boxSelectEnd.type,
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
  setRoute,
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
  boxSelectStart,
  boxSelectSpawns,
  boxSelectEnd,
  setPulls,
  addNote,
  editNote,
  deleteNote,
  moveNote,
} = baseReducer.actions
