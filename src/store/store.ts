import { configureStore } from '@reduxjs/toolkit'
import { listenerMiddleware, routesReducer } from './routesReducer.ts'
import { hoverReducer } from './hoverReducer.ts'
import { importReducer } from './importReducer.ts'
import { persistStore } from 'redux-persist'
import { toastReducer } from './toastReducer.ts'

export const store = configureStore({
  reducer: {
    routes: routesReducer,
    hover: hoverReducer,
    import: importReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: { warnAfter: 100 } }).prepend(
      listenerMiddleware.middleware,
    ),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
