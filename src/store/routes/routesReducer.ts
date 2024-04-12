import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { Drawing, MdtRoute, Note, Pull, Route, SavedRoute } from '../../util/types.ts'
import type { SpawnId } from '../../data/types.ts'
import { mdtRouteToRoute } from '../../util/mdtUtil.ts'
import undoable, { combineFilters, excludeAction, includeAction } from 'redux-undo'
import { addPullFunc, boxSelectSpawnsAction, toggleSpawnAction } from './routeActions.ts'
import * as localforage from 'localforage'
import type { AppDispatch, RootState } from '../store.ts'
import { persistReducer } from 'redux-persist'
import { indexedDbStorage } from '../storage.ts'
import { routeMigrate, routePersistVersion } from './routeMigrations.ts'
import { addToast } from '../reducers/toastReducer.ts'
import { createAppSlice } from '../storeUtil.ts'
import type { DungeonKey } from '../../data/dungeonKeys.ts'
import { setMapMode } from '../reducers/mapReducer.ts'

export interface RouteState {
  route: Route
  selectedPull: number
  savedRoutes: SavedRoute[]
  collabBackupRoute?: Route | null
  liveBackupRoute?: Route | null
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
export async function loadRouteFromStorage(routeId: string, dispatch: AppDispatch) {
  const route = await localforage.getItem<Route>(getSavedRouteKey(routeId))
  if (route !== null) return route

  const errorMessage = `Could not find route to load. Removing from saved routes list.`
  console.error(errorMessage)
  dispatch(deleteSavedRoute(routeId))
  dispatch(addToast({ message: errorMessage, type: 'error' }))
  throw new Error(`Failed to load route ${routeId}`)
}

export const saveRoute = (route: Route) => localforage.setItem(getSavedRouteKey(route.uid), route)

export const loadRoute = createAsyncThunk('routes/loadRoute', (routeId: string, thunkAPI) => {
  return loadRouteFromStorage(routeId, thunkAPI.dispatch as AppDispatch)
})

export const getLastDungeonRoute = async (
  dungeonKey: DungeonKey,
  savedRoutes: SavedRoute[],
  dispatch: AppDispatch,
) => {
  // This can be called from the Error handler, so we want to handle the cases where dungeonKey is nullish
  const dungeonRoutes = savedRoutes.filter((route) =>
    dungeonKey ? route.dungeonKey === dungeonKey : true,
  )
  if (dungeonRoutes.length) {
    return await loadRouteFromStorage(dungeonRoutes[dungeonRoutes.length - 1]!.uid, dispatch)
  } else {
    return makeEmptyRoute(dungeonKey, savedRoutes)
  }
}

export const setDungeon = createAsyncThunk(
  'routes/setDungeon',
  async (dungeonKey: DungeonKey, thunkAPI) => {
    const state = thunkAPI.getState() as RootState
    return await getLastDungeonRoute(
      dungeonKey,
      state.routes.present.savedRoutes,
      thunkAPI.dispatch as AppDispatch,
    )
  },
)

export const deleteRoute = createAsyncThunk('routes/deleteRoute', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootState
  const routeId = state.routes.present.route.uid
  await localforage.removeItem(getSavedRouteKey(routeId))

  const savedRoutes = state.routes.present.savedRoutes.filter((route) => route.uid !== routeId)
  const route = await getLastDungeonRoute(
    state.routes.present.route.dungeonKey,
    savedRoutes,
    thunkAPI.dispatch as AppDispatch,
  )
  return { deletedRouteId: routeId, route }
})

export const defaultDungeonKey: DungeonKey = 'eb'

export const initialState: RouteState = {
  route: makeEmptyRoute(defaultDungeonKey, []),
  selectedPull: 0,
  savedRoutes: [],
}

function setRouteFresh(state: RouteState, route: Route) {
  if (route.uid !== state.route.uid) state.selectedPull = 0
  state.route = route
}

function giveRouteNewNameUid(state: RouteState, route: Route) {
  route.uid = newRouteUid()
  route.name = nextName(route.name, route.dungeonKey, state.savedRoutes)
}

const baseReducer = createAppSlice({
  name: 'routes',
  initialState,
  reducers: {
    setRouteForCollab(state, { payload: route }: PayloadAction<Route>) {
      setRouteFresh(state, route)
    },
    newRoute(state, { payload: dungeonKey }: PayloadAction<DungeonKey | undefined>) {
      const route = makeEmptyRoute(dungeonKey ?? state.route.dungeonKey, state.savedRoutes)
      setRouteFresh(state, route)
    },
    duplicateRoute(state) {
      giveRouteNewNameUid(state, state.route)
    },
    setRouteFromMdt(
      state,
      { payload: { mdtRoute, copy } }: PayloadAction<{ mdtRoute: MdtRoute; copy?: boolean }>,
    ) {
      const route = mdtRouteToRoute(mdtRoute)
      if (copy) giveRouteNewNameUid(state, route)
      setRouteFresh(state, route)
    },
    setRouteFromSample(state, { payload: route }: PayloadAction<Route>) {
      const newRoute = { ...route }
      giveRouteNewNameUid(state, newRoute)
      setRouteFresh(state, newRoute)
    },
    backupCollabRoute(state) {
      state.collabBackupRoute = state.route
    },
    restoreLiveBackup(state) {
      if (!state.liveBackupRoute) return
      state.route = state.liveBackupRoute
      state.liveBackupRoute = null
    },
    clearRoute(state) {
      state.route.pulls = [emptyPull]
      state.route.notes = []
      state.selectedPull = 0
    },
    clearDrawings(state) {
      state.route.drawings = []
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
    toggleSpawn(
      state,
      { payload }: PayloadAction<{ spawn: SpawnId; individual: boolean; newPull: boolean }>,
    ) {
      state.route.pulls = toggleSpawnAction(state, payload)
    },
    removeInvalidSpawns(state, { payload: invalidSpawnIds }: PayloadAction<SpawnId[]>) {
      state.route.pulls = state.route.pulls.map((pull) => ({
        ...pull,
        spawns: pull.spawns.filter((spawnId) => !invalidSpawnIds.includes(spawnId)),
      }))
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
      const curNote = state.route.notes[noteIndex]
      if (!curNote) return
      state.route.notes[noteIndex] = { ...curNote, ...changes }
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
    addDrawing(state, { payload: partialDrawing }: PayloadAction<Omit<Drawing, 'id'>>) {
      const maxId = state.route.drawings.reduce<number>((acc, { id }) => (id > acc ? id : acc), 0)
      const drawing = { ...partialDrawing, id: maxId + 1 }
      state.route.drawings.push(drawing)
    },
    deleteDrawing(state, { payload: drawing }: PayloadAction<Drawing>) {
      state.route.drawings = state.route.drawings.filter(({ id }) => id !== drawing.id)
    },
    updateDrawing(state, { payload: newDrawing }: PayloadAction<Drawing>) {
      state.route.drawings = state.route.drawings.map((oldDrawing) =>
        oldDrawing.id === newDrawing.id ? newDrawing : oldDrawing,
      )
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
    deleteSavedRoute(state, { payload: routeId }: PayloadAction<string>) {
      state.savedRoutes = state.savedRoutes.filter((route) => route.uid !== routeId)
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

    builder.addCase(setMapMode, (state, { payload }) => {
      if (payload === 'live') {
        state.selectedPull = 0
        state.liveBackupRoute = state.route
      } else {
        if (state.liveBackupRoute) {
          state.route = state.liveBackupRoute
        }
        state.liveBackupRoute = null
      }
    })

    builder.addMatcher(
      (action) => action.type.startsWith('routes/'),
      (state) => {
        if (state.selectedPull < 0) state.selectedPull = 0
        else if (state.selectedPull >= state.route.pulls.length)
          state.selectedPull = state.route.pulls.length - 1
      },
    )
  },
})

const undoableReducer = undoable(baseReducer.reducer, {
  limit: 100,
  filter: combineFilters(
    includeAction([
      baseReducer.actions.setRouteForCollab.type,
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
      baseReducer.actions.moveNote.type,
      baseReducer.actions.addDrawing.type,
      baseReducer.actions.deleteDrawing.type,
      baseReducer.actions.updateDrawing.type,
      baseReducer.actions.clearDrawings.type,
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
  newRoute,
  duplicateRoute,
  setRouteForCollab,
  setRouteFromMdt,
  setRouteFromSample,
  backupCollabRoute,
  restoreLiveBackup,
  clearRoute,
  clearDrawings,
  setName,
  addPull,
  appendPull,
  prependPull,
  clearPull,
  deletePull,
  selectPull,
  selectPullRelative,
  toggleSpawn,
  removeInvalidSpawns,
  boxSelectStart,
  boxSelectSpawns,
  boxSelectEnd,
  setPulls,
  addNote,
  editNote,
  deleteNote,
  addDrawing,
  deleteDrawing,
  updateDrawing,
  moveNote,
  updateSavedRoutes,
  deleteSavedRoute,
} = baseReducer.actions
