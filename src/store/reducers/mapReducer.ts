import { PayloadAction } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import { createAppSlice, useRootSelector } from '../storeUtil.ts'

export interface MapState {
  objectsHidden: boolean
}

const initialState: MapState = {
  objectsHidden: true,
}

export const mapSlice = createAppSlice({
  name: 'map',
  initialState,
  reducers: {
    setMapObjectsHidden(state, { payload: hidden }: PayloadAction<boolean>) {
      state.objectsHidden = hidden
    },
  },
})

export function useMapObjectsHidden(minDelay: number = 0, maxDelay: number = 100) {
  const hidden = useRootSelector((state) => state.map.objectsHidden)
  const [delayedHidden, setDelayedHidden] = useState(hidden)

  useEffect(() => {
    if (!hidden) setTimeout(() => setDelayedHidden(false), minDelay + Math.random() * maxDelay)
    else setDelayedHidden(true)
  }, [hidden, minDelay, maxDelay])

  return delayedHidden
}

export const mapReducer = mapSlice.reducer

export const { setMapObjectsHidden } = mapSlice.actions
