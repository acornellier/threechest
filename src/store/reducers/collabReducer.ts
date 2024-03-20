import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'
import { LatLng } from 'leaflet'
import { postAwarenessUpdateChecks } from './collabActions.ts'

export type ClientType = 'host' | 'guest'

export interface AwarenessState extends BaseAwarenessState {
  name: string
  clientType?: ClientType
  joinTime?: number
  color?: string | null
  mousePosition?: LatLng | null
}

export interface CollabState {
  active: boolean
  wsConnected: boolean
  room: string
  startedCollab: boolean
  awarenessStates: AwarenessState[]
}

const initialState: CollabState = {
  active: false,
  wsConnected: false,
  room: '',
  startedCollab: false,
  awarenessStates: [],
}

const getLocalAwareness = (state: CollabState) =>
  state.awarenessStates.find(({ isCurrentClient }) => isCurrentClient)

export const collabSlice = createSlice({
  name: 'collab',
  initialState,
  reducers: {
    startCollab(state, { payload: room }: PayloadAction<string>) {
      state.active = true
      state.room = room
      state.startedCollab = true
      state.awarenessStates = []
    },
    endCollab(state) {
      state.active = false
      state.startedCollab = false
      state.awarenessStates = []
    },
    joinCollab(state, { payload: room }: PayloadAction<string>) {
      state.active = true
      state.room = room
      state.startedCollab = false
      state.awarenessStates = []
    },
    setWsConnected(state, { payload: connected }: PayloadAction<boolean>) {
      state.wsConnected = connected

      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      postAwarenessUpdateChecks(state, localAwareness)
    },
    setAwarenessStates(state, { payload: awarenessStates }: PayloadAction<AwarenessState[]>) {
      state.awarenessStates = awarenessStates

      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      postAwarenessUpdateChecks(state, localAwareness)
    },
    setMousePosition(
      state,
      { payload: mousePosition }: PayloadAction<AwarenessState['mousePosition']>,
    ) {
      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      localAwareness.mousePosition = mousePosition
    },
    setCollabName(state, { payload: name }: PayloadAction<string>) {
      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      localAwareness.name = name
    },
    setCollabColor(state, { payload: color }: PayloadAction<string>) {
      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      localAwareness.color = color
    },
  },
})

export const collabReducer = collabSlice.reducer

export const {
  startCollab,
  endCollab,
  joinCollab,
  setWsConnected,
  setAwarenessStates,
  setMousePosition,
  setCollabName,
  setCollabColor,
} = collabSlice.actions
