import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MapState {
  objectsHidden: boolean
}

const initialState: MapState = {
  objectsHidden: true,
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setMapObjectsHidden(state, { payload: hidden }: PayloadAction<boolean>) {
      state.objectsHidden = hidden
    },
  },
})

export const mapReducer = mapSlice.reducer

export const { setMapObjectsHidden } = mapSlice.actions
