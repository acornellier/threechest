import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { MobSpawn } from '../data/types.ts'
import { mobSpawnsEqual } from '../util/mobSpawns.ts'

export interface HoverState {
  hoveredPull: number | null
  hoveredMobSpawn: MobSpawn | null
  selectedMobSpawn: MobSpawn | null
  isBoxHovering: boolean
  boxHoveredMobSpawns: MobSpawn[]
}

const initialState: HoverState = {
  hoveredPull: null,
  hoveredMobSpawn: null,
  selectedMobSpawn: null,
  isBoxHovering: false,
  boxHoveredMobSpawns: [],
}

export const hoverSlice = createSlice({
  name: 'hover',
  initialState,
  reducers: {
    hoverPull(state, { payload: mobSpawn }: PayloadAction<number | null>) {
      state.hoveredPull = mobSpawn
    },
    hoverMobSpawn(state, { payload: mobSpawn }: PayloadAction<MobSpawn | null>) {
      if (state.isBoxHovering && mobSpawn !== null) return

      state.hoveredMobSpawn = mobSpawn
    },
    selectMobSpawn(state, { payload: mobSpawn }: PayloadAction<MobSpawn | null>) {
      if (
        mobSpawn === null ||
        state.selectedMobSpawn === null ||
        !mobSpawnsEqual(mobSpawn, state.selectedMobSpawn)
      ) {
        state.selectedMobSpawn = mobSpawn
      } else {
        state.selectedMobSpawn = null
      }
    },
    setBoxHovering(state, { payload }: PayloadAction<boolean>) {
      state.isBoxHovering = payload
    },
    boxHoverMobSpawns(state, { payload }: PayloadAction<MobSpawn[]>) {
      state.boxHoveredMobSpawns = payload
    },
  },
})

export const hoverReducer = hoverSlice.reducer

export const { hoverPull, hoverMobSpawn, selectMobSpawn, setBoxHovering, boxHoverMobSpawns } =
  hoverSlice.actions
