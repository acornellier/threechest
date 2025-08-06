import { createMigrate } from 'redux-persist'
import type { RouteState } from './routesReducer.ts'
import { initialState } from './routesReducer.ts'
import type { StateWithHistory } from 'redux-undo'
import localforage from 'localforage'

type PersistedStateCur = StateWithHistory<RouteState>

type PersistedStatePrev = StateWithHistory<RouteState>

export const routePersistVersion = 9

/*
 * Each migration step will take one version as input and return the next version as output.
 * (The key `2` means that it is the step which migrates from V1 to V2.)
 */
const persistMigrations = {
  [routePersistVersion]: async (state: PersistedStatePrev): Promise<PersistedStateCur> => {
    await localforage.clear()
    return {
      ...state,
      past: [],
      future: [],
      present: initialState,
    }
  },
}

type MigrationState = PersistedStateCur | PersistedStatePrev

export const routeMigrate = createMigrate<MigrationState>(persistMigrations)
