import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { MdtRoute, Pull, Route, SavedRoute } from '../code/types.ts'
import { DungeonKey, MobSpawn } from '../data/types.ts'
import { mdtRouteToRoute } from '../code/mdtUtil.ts'
import undoable, { includeAction } from 'redux-undo'
import { addPullFunc, toggleSpawnAction } from './actions.ts'

export interface State {
  route: Route
  hoveredPull: number | null
  hoveredMobSpawn: MobSpawn | null
  savedRoutes: SavedRoute[]
}

const emptyPull = { id: 0, mobSpawns: [] }

const newRouteUid = () => Math.random().toString(36).slice(2)

const defaultName = 'New route '
function nextName(dungeonKey: DungeonKey, savedRoutes: SavedRoute[]) {
  const defaultNamesRoutes = savedRoutes.filter(
    (route) => route.dungeonKey === dungeonKey && route.name.startsWith(defaultName),
  )
  const numbers = defaultNamesRoutes.map((route) => route.name.split(defaultName)[1]).map(Number)
  const maxNumber = numbers.reduce((acc, cur) => (cur > acc ? cur : acc), 0)
  return defaultName + (maxNumber + 1).toString()
}

const makeEmptyRoute = (dungeonKey: DungeonKey, savedRoutes: SavedRoute[]): Route => ({
  name: nextName(dungeonKey, savedRoutes),
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
    hoveredPull: null,
    hoveredMobSpawn: null,
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
      }
    },
    setDungeon(state, { payload: dungeonKey }: PayloadAction<DungeonKey>) {
      const matchingRoutes = state.savedRoutes.filter((route) => route.dungeonKey === dungeonKey)
      state.route = matchingRoutes.length
        ? loadRouteFromStorage(matchingRoutes[matchingRoutes.length - 1].uid)
        : makeEmptyRoute(dungeonKey, state.savedRoutes)
      state.hoveredPull = null
    },
    newRoute(state) {
      state.route = makeEmptyRoute(state.route.dungeonKey, state.savedRoutes)
      state.hoveredPull = null
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
      state.hoveredPull = null
    },
    importRoute(state, { payload }: PayloadAction<MdtRoute>) {
      state.route = mdtRouteToRoute(payload)
      state.hoveredPull = null
    },
    clearRoute(state) {
      state.route.pulls = [emptyPull]
      state.hoveredPull = null
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
    hoverPull(state, { payload }: PayloadAction<number | null>) {
      state.hoveredPull = payload
    },
    hoverMobSpawn(state, { payload }: PayloadAction<MobSpawn | null>) {
      state.hoveredMobSpawn = payload
    },
    toggleSpawn(state, { payload }: PayloadAction<{ mobSpawn: MobSpawn; individual: boolean }>) {
      state.route.pulls = toggleSpawnAction(state.route, payload)
    },
    setPulls(state, { payload }: PayloadAction<Pull[]>) {
      state.route.pulls = payload
    },
  },
})

export const reducer = undoable(baseReducer.reducer, {
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

// Action creators are generated for each case reducer function
export const {
  updateSavedRoutes,
  setDungeon,
  newRoute,
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
  hoverPull,
  hoverMobSpawn,
  toggleSpawn,
  setPulls,
} = baseReducer.actions
