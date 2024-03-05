import { configureStore } from '@reduxjs/toolkit'
import { routesReducer } from './routesReducer.ts'
import { hoverReducer } from './hoverReducer.ts'

export const store = configureStore({
  reducer: {
    routes: routesReducer,
    hover: hoverReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
