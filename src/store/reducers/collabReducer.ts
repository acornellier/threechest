import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'
import { LatLng } from 'leaflet'

export interface AwarenessState extends BaseAwarenessState {
  mousePosition?: LatLng | null
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
    setMousePosition(
      state,
      { payload: mousePosition }: PayloadAction<AwarenessState['mousePosition']>,
    ) {
      const localAwareness = state.awarenessStates.find(({ isCurrentClient }) => isCurrentClient)
      if (localAwareness) localAwareness.mousePosition = mousePosition
    },
  },
})

export const collabReducer = collabSlice.reducer

export const { startCollab, endCollab, joinCollab, setAwarenessStates, setMousePosition } =
  collabSlice.actions
