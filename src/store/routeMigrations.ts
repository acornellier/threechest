import { createMigrate } from 'redux-persist'
import { initialState, RouteState } from './routesReducer.ts'
import { StateWithHistory } from 'redux-undo'

type PersistedStateV3 = StateWithHistory<RouteState>

type PersistedStateV2 = StateWithHistory<RouteState>

/*
 * Each migration step will take one version as input and return the next version as output.
 * (The key `2` means that it is the step which migrates from V1 to V2.)
 */
const persistMigrations = {
  3: (state: PersistedStateV2): PersistedStateV3 => {
    return {
      ...state,
      past: [],
      future: [],
      present: initialState,
    }
  },
}

type MigrationState = PersistedStateV3 | PersistedStateV2

export const routeMigrate = createMigrate<MigrationState>(persistMigrations)

export const routePersistVersion = 3
