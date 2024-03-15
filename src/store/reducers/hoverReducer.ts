import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { SpawnId } from '../../data/types.ts'

export interface HoverState {
  hoveredPull: number | null
  hoveredSpawn: SpawnId | null
  selectedSpawn: SpawnId | null
  isBoxHovering: boolean
  boxHoveredSpawns: SpawnId[]
}

const initialState: HoverState = {
  hoveredPull: null,
  hoveredSpawn: null,
  selectedSpawn: null,
  isBoxHovering: false,
  boxHoveredSpawns: [],
}

export const hoverSlice = createSlice({
  name: 'hover',
  initialState,
  reducers: {
    hoverPull(state, { payload: mobSpawn }: PayloadAction<number | null>) {
      state.hoveredPull = mobSpawn
    },
    hoverSpawn(state, { payload: spawn }: PayloadAction<SpawnId | null>) {
      if (state.isBoxHovering && spawn !== null) return

      state.hoveredSpawn = spawn
    },
    selectSpawn(state, { payload: spawn }: PayloadAction<SpawnId | null>) {
      if (spawn === null || spawn !== state.selectedSpawn) {
        state.selectedSpawn = spawn
      } else {
        state.selectedSpawn = null
      }
    },
    setBoxHovering(state, { payload }: PayloadAction<boolean>) {
      state.isBoxHovering = payload
    },
  },
})

export const hoverReducer = hoverSlice.reducer

export const { hoverPull, hoverSpawn, selectSpawn, setBoxHovering } = hoverSlice.actions
