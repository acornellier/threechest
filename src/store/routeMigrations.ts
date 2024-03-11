import { createMigrate } from 'redux-persist'
import { initialState, RouteState } from './routesReducer.ts'
import { StateWithHistory } from 'redux-undo'

type PersistedStateV2 = StateWithHistory<RouteState>
type PersistedStateV1 = StateWithHistory<RouteState>

/*
 * Each migration step will take one version as input and return the next version as output.
 * (The key `2` means that it is the step which migrates from V1 to V2.)
 */
const persistMigrations = {
  2: (state: PersistedStateV1): PersistedStateV2 => {
    return {
      ...state,
      past: [],
      future: [],
      present: initialState,
    }
  },
}

type MigrationState = PersistedStateV1 | PersistedStateV2

export const routeMigrate = createMigrate<MigrationState>(persistMigrations)

export const routePersistVersion = 2
