import type { PayloadAction } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import { createAppSlice, useRootSelector } from '../storeUtil.ts'

export type MapMode = 'editing' | 'drawing' | 'live'
export type DrawMode = 'drawing' | 'deleting' | 'erasing'

export interface MapState {
  objectsHidden: boolean
  sidebarCollapsed: boolean
  mapMode: MapMode
  isErasing: boolean
  drawMode: DrawMode
  drawColor: string
  drawWeight: number
}

const drawColorKey = 'drawColorKey'
const drawWeightKey = 'drawWeightKey'

const initialState: MapState = {
  objectsHidden: true,
  sidebarCollapsed: false,
  mapMode: 'editing',
  isErasing: false,
  drawMode: 'drawing',
  drawColor: localStorage.getItem(drawColorKey) || 'blue',
  drawWeight: Number(localStorage.getItem(drawWeightKey)) || 4,
}

export const mapSlice = createAppSlice({
  name: 'map',
  initialState,
  reducers: {
    setMapObjectsHidden(state, { payload: hidden }: PayloadAction<boolean>) {
      state.objectsHidden = hidden
    },
    setSidebarCollapsed(state, { payload: collapsed }: PayloadAction<boolean>) {
      state.sidebarCollapsed = collapsed
    },
    setMapMode(state, { payload: mapMode }: PayloadAction<MapMode>) {
      state.mapMode = mapMode
      if (mapMode === 'drawing') {
        state.drawMode = 'drawing'
        state.isErasing = false
      }
    },
    setIsErasing(state, { payload: isErasing }: PayloadAction<boolean>) {
      state.isErasing = isErasing
    },
    setDrawMode(state, { payload: drawMode }: PayloadAction<DrawMode>) {
      state.drawMode = drawMode
      state.isErasing = false
    },
    setDrawColor(state, { payload: drawColor }: PayloadAction<string>) {
      state.drawColor = drawColor
      localStorage.setItem(drawColorKey, drawColor)
    },
    setDrawWeight(state, { payload: drawWeight }: PayloadAction<number>) {
      state.drawWeight = drawWeight
      localStorage.setItem(drawWeightKey, drawWeight.toString())
    },
  },
  selectors: {
    selectIsLive: (state) => state.mapMode === 'live',
  },
})

export function useMapObjectsHidden(minDelay: number = 0, maxDelay: number = 100) {
  const hidden = useRootSelector((state) => state.map.objectsHidden)
  const [delayedHidden, setDelayedHidden] = useState(true)

  useEffect(() => {
    if (!hidden) setTimeout(() => setDelayedHidden(false), minDelay + Math.random() * maxDelay)
    else setDelayedHidden(true)
  }, [hidden, minDelay, maxDelay])

  return delayedHidden
}

export const mapReducer = mapSlice.reducer

export const {
  setMapObjectsHidden,
  setSidebarCollapsed,
  setMapMode,
  setIsErasing,
  setDrawMode,
  setDrawColor,
  setDrawWeight,
} = mapSlice.actions

export const { selectIsLive } = mapSlice.selectors
