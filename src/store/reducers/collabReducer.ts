import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CollabState {
  active: boolean
  room: string
  clientType: 'host' | 'guest'
}

const initialState: CollabState = {
  active: false,
  room: '',
  clientType: 'guest',
}

export const collabSlice = createSlice({
  name: 'collab',
  initialState,
  reducers: {
    startCollab(state, { payload: room }: PayloadAction<string>) {
      state.active = true
      state.room = room
      state.clientType = 'host'
    },
    endCollab(state) {
      state.active = false
    },
    joinCollab(state, { payload: room }: PayloadAction<string>) {
      state.active = true
      state.room = room
      state.clientType = 'guest'
    },
  },
})

export const collabReducer = collabSlice.reducer

export const { startCollab, endCollab, joinCollab } = collabSlice.actions
