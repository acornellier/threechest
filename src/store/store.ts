import { configureStore } from '@reduxjs/toolkit'
import { routesReducer } from './routes/routesReducer.ts'
import { hoverReducer } from './reducers/hoverReducer.ts'
import { importReducer } from './reducers/importReducer.ts'
import { persistStore } from 'redux-persist'
import { toastReducer } from './reducers/toastReducer.ts'
import { listenerMiddleware } from './listener.ts'
import { mapReducer } from './reducers/mapReducer.ts'
import { collabReducer } from './reducers/collabReducer.ts'

export const store = configureStore({
  reducer: {
    routes: routesReducer,
    hover: hoverReducer,
    import: importReducer,
    map: mapReducer,
    toast: toastReducer,
    collab: collabReducer,
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
