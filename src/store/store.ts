import { configureStore } from '@reduxjs/toolkit'
import { routesReducer } from './routes/routesReducer.ts'
import { hoverReducer } from './reducers/hoverReducer.ts'
import { importReducer } from './reducers/importReducer.ts'
import { persistStore } from 'redux-persist'
import { toastReducer } from './reducers/toastReducer.ts'
import { listenerMiddleware } from './listener.ts'
import { mapReducer } from './reducers/mapReducer.ts'
import { collabReducer } from './collab/collabReducer.ts'
import { cloudReducer } from './reducers/cloudReducer.ts'
import { mobSearchReducer } from './reducers/mobSearchReducer.ts'
import { compareReducer } from './reducers/compareReducer.ts'

export const store = configureStore({
  reducer: {
    routes: routesReducer,
    hover: hoverReducer,
    import: importReducer,
    compare: compareReducer,
    map: mapReducer,
    toast: toastReducer,
    collab: collabReducer,
    cloud: cloudReducer,
    mobSearch: mobSearchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: { warnAfter: 200 } }).prepend(
      listenerMiddleware.middleware,
    ),
})

export const persistor = persistStore(store)

export type AppStore = typeof store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
