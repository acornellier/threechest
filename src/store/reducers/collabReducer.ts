import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'

export interface AwarenessState extends BaseAwarenessState {
  cursorPosition: { x: 100; y: 200 }
}

export interface CollabState {
  active: boolean
  room: string
  clientType: 'host' | 'guest'
  awarenessStates: AwarenessState[]
}

const initialState: CollabState = {
  active: false,
  room: '',
  clientType: 'guest',
  awarenessStates: [],
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
    setAwarenessStates(state, { payload: awarenessStates }: PayloadAction<AwarenessState[]>) {
      state.awarenessStates = awarenessStates
    },
    setCursorPosition(
      state,
      { payload: cursorPosition }: PayloadAction<AwarenessState['cursorPosition']>,
    ) {
      const localAwareness = state.awarenessStates.find(({ isCurrentClient }) => isCurrentClient)
      if (localAwareness) localAwareness.cursorPosition = cursorPosition
    },
  },
})

export const collabReducer = collabSlice.reducer

export const { startCollab, endCollab, joinCollab, setAwarenessStates } = collabSlice.actions
