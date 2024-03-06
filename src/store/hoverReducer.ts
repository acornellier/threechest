import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { MobSpawn } from '../data/types.ts'

export interface HoverState {
  hoveredPull: number | null
  hoveredMobSpawn: MobSpawn | null
}

const initialState: HoverState = {
  hoveredPull: null,
  hoveredMobSpawn: null,
}

export const hoverSlice = createSlice({
  name: 'hover',
  initialState,
  reducers: {
    hoverPull(state, { payload }: PayloadAction<number | null>) {
      state.hoveredPull = payload
    },
    hoverMobSpawn(state, { payload }: PayloadAction<MobSpawn | null>) {
      state.hoveredMobSpawn = payload
    },
  },
})

export const hoverReducer = hoverSlice.reducer

export const { hoverPull, hoverMobSpawn } = hoverSlice.actions
