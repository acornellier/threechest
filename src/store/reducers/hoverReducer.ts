import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { SpawnId } from '../../data/types.ts'
import { findMobSpawn } from '../../util/mobSpawns.ts'
import { useDungeon, usePreviewRoute } from '../routes/routeHooks.ts'
import { useRootSelector } from '../hooks.ts'

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
  selectors: {
    selectHoveredPull: (state) => state.hoveredPull,
    selectHoveredSpawn: (state) => state.hoveredSpawn,
    selectSelectedSpawn: (state) => state.selectedSpawn,
    selectIsBoxHovering: (state) => state.isBoxHovering,
  },
})

export const useHoveredPull = () => {
  const previewRoute = usePreviewRoute()
  const hoveredPull = useRootSelector(selectHoveredPull)
  return previewRoute ? null : hoveredPull
}

export function useHoveredMobSpawn() {
  const dungeon = useDungeon()
  const hoveredMobSpawn = useRootSelector(selectHoveredSpawn)
  return hoveredMobSpawn === null ? null : findMobSpawn(hoveredMobSpawn, dungeon)
}

export const hoverReducer = hoverSlice.reducer

export const { hoverPull, hoverSpawn, selectSpawn, setBoxHovering } = hoverSlice.actions

export const { selectHoveredPull, selectHoveredSpawn, selectSelectedSpawn, selectIsBoxHovering } =
  hoverSlice.selectors
