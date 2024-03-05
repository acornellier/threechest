import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { MdtRoute, Pull, Route, SavedRoute } from '../code/types.ts'
import { DungeonKey, MobSpawn } from '../data/types.ts'
import { mdtRouteToRoute } from '../code/mdtUtil.ts'
import undoable, { includeAction } from 'redux-undo'
import { addPullFunc, toggleSpawnAction } from './actions.ts'

export interface State {
  route: Route
  savedRoutes: SavedRoute[]
}

const emptyPull = { id: 0, mobSpawns: [] }

const newRouteUid = () => Math.random().toString(36).slice(2)

function nextName(routeName: string, dungeonKey: DungeonKey, savedRoutes: SavedRoute[]) {
  const match = routeName.match(/(.*\s)(\d+)$/)
  const baseName = match ? match[1] : routeName
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
  uid: newRouteUid(),
})

const savedRouteKey = 'savedRoute'
export const getSavedRouteKey = (routeId: string) => [savedRouteKey, routeId].join('-')
function loadRouteFromStorage(routeId: string) {
  const route = window.localStorage.getItem(getSavedRouteKey(routeId))
  if (route === null) throw new Error(`Could not load route ${routeId}`)

  return JSON.parse(route) as Route
}

export const lastRouteKeyKey = 'lastRouteKey'
function getLastRoute(savedRoutes: SavedRoute[]): Route {
  const lastRouteId = window.localStorage.getItem(lastRouteKeyKey)
  return lastRouteId ? loadRouteFromStorage(lastRouteId) : makeEmptyRoute('eb', savedRoutes)
}

export const savedRoutesKey = 'savedRoutes'
function getSavedRoutes(): SavedRoute[] {
  const savedRoutes = window.localStorage.getItem(savedRoutesKey)
  return savedRoutes ? JSON.parse(savedRoutes) : []
}

function initialState(): State {
  const savedRoutes = getSavedRoutes()
  return {
    route: getLastRoute(savedRoutes),
    savedRoutes,
  }
}

const baseReducer = createSlice({
  name: 'main',
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
    setDungeon(state, { payload: dungeonKey }: PayloadAction<DungeonKey>) {
      const matchingRoutes = state.savedRoutes.filter((route) => route.dungeonKey === dungeonKey)
      state.route = matchingRoutes.length
        ? loadRouteFromStorage(matchingRoutes[matchingRoutes.length - 1].uid)
        : makeEmptyRoute(dungeonKey, state.savedRoutes)
    },
    newRoute(state) {
      state.route = makeEmptyRoute(state.route.dungeonKey, state.savedRoutes)
    },
    duplicateRoute(state) {
      state.route = {
        ...state.route,
        uid: newRouteUid(),
        name: nextName(state.route.name, state.route.dungeonKey, state.savedRoutes),
      }
    },
    deleteRoute(state) {
      state.savedRoutes = state.savedRoutes.filter((route) => route.uid !== state.route.uid)
      localStorage.removeItem(getSavedRouteKey(state.route.uid))

      const dungeonRoutes = state.savedRoutes.filter(
        (route) => route.dungeonKey === state.route.dungeonKey,
      )

      const lastDungeonRoute = dungeonRoutes[dungeonRoutes.length - 1]
      state.route = lastDungeonRoute
        ? loadRouteFromStorage(lastDungeonRoute.uid)
        : makeEmptyRoute(state.route.dungeonKey, state.savedRoutes)
    },
    loadRoute(state, { payload: routeId }: PayloadAction<string>) {
      state.route = loadRouteFromStorage(routeId)
    },
    importRoute(state, { payload }: PayloadAction<MdtRoute>) {
      state.route = mdtRouteToRoute(payload)
    },
    clearRoute(state) {
      state.route.pulls = [emptyPull]
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
    deletePull(state, { payload = state.route.selectedPull }: PayloadAction<number | undefined>) {
      state.route.pulls = state.route.pulls.filter((_, index) => index !== payload)
      if (state.route.selectedPull >= state.route.pulls.length) {
        state.route.selectedPull -= 1
      }
    },
    selectPull(state, { payload }: PayloadAction<number>) {
      if (payload >= 0 && payload < state.route.pulls.length) {
        state.route.selectedPull = payload
      }
    },
    selectPullRelative(state, { payload }: PayloadAction<number>) {
      const newIndex = state.route.selectedPull + payload
      if (newIndex >= 0 && newIndex < state.route.pulls.length) {
        state.route.selectedPull = newIndex
      }
    },
    toggleSpawn(state, { payload }: PayloadAction<{ mobSpawn: MobSpawn; individual: boolean }>) {
      state.route.pulls = toggleSpawnAction(state.route, payload)
    },
    setPulls(state, { payload }: PayloadAction<Pull[]>) {
      state.route.pulls = payload
    },
  },
})

export const routesReducer = undoable(baseReducer.reducer, {
  filter: includeAction([
    baseReducer.actions.newRoute.type,
    baseReducer.actions.clearRoute.type,
    baseReducer.actions.addPull.type,
    baseReducer.actions.prependPull.type,
    baseReducer.actions.appendPull.type,
    baseReducer.actions.deletePull.type,
    baseReducer.actions.toggleSpawn.type,
    baseReducer.actions.setPulls.type,
  ]),
})

// Action creators are generated for each case mainReducer function
export const {
  updateSavedRoutes,
  setDungeon,
  newRoute,
  duplicateRoute,
  deleteRoute,
  loadRoute,
  importRoute,
  clearRoute,
  setName,
  addPull,
  appendPull,
  deletePull,
  selectPull,
  selectPullRelative,
  toggleSpawn,
  setPulls,
} = baseReducer.actions
