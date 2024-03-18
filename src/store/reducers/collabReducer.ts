import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface MapState {
  active: boolean
  room: string
}

const initialState: MapState = {
  active: false,
  room: '',
}

export const collabSlice = createSlice({
  name: 'collab',
  initialState,
  reducers: {
    startCollab(state, { payload: room }: PayloadAction<string>) {
      state.active = true
      state.room = room
    },
    endCollab(state) {
      state.active = false
      state.room = ''
    },
    joinCollab(state, { payload: room }: PayloadAction<string>) {
      state.active = true
      state.room = room
    },
  },
})

export const collabReducer = collabSlice.reducer

export const { startCollab, endCollab, joinCollab } = collabSlice.actions
