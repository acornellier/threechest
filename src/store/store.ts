import { configureStore } from '@reduxjs/toolkit'
import { routesReducer } from './routesReducer.ts'
import { hoverReducer } from './hoverReducer.ts'
import { persistStore } from 'redux-persist'

export const store = configureStore({
  reducer: {
    routes: routesReducer,
    hover: hoverReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
