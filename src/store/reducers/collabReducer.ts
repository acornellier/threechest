import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'
import { LatLng } from 'leaflet'
import { RootState } from '../store.ts'
import { savedCollabColorKey, savedCollabNameKey } from '../hooks.ts'
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

export const setInitialAwareness = createAsyncThunk(
  'collab/setInitialAwareness',
  async (localAwareness: AwarenessState, thunkAPI) => {
    const state = thunkAPI.getState() as RootState
    if (state.collab.startedCollab) localAwareness.clientType = 'host'

    const savedName = localStorage.getItem(savedCollabNameKey)
    if (savedName) localAwareness.name = savedName

    const savedColor = localStorage.getItem(savedCollabColorKey)
    if (savedColor) localAwareness.color = savedColor

    thunkAPI.dispatch(setLocalAwareness(localAwareness))
  },
)

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
    },
    setAwarenessStates(state, { payload: awarenessStates }: PayloadAction<AwarenessState[]>) {
      state.awarenessStates = awarenessStates

      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      postAwarenessUpdateChecks(state, localAwareness)
    },
    setLocalAwareness(state, { payload: localAwareness }: PayloadAction<AwarenessState>) {
      state.awarenessStates = state.awarenessStates.map((awareness) =>
        awareness.clientId === localAwareness.clientId ? localAwareness : awareness,
      )

      postAwarenessUpdateChecks(state, localAwareness)
    },
    promoteToHost(state) {
      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      localAwareness.clientType = 'host'
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
  setLocalAwareness,
  setMousePosition,
  setCollabName,
  setCollabColor,
} = collabSlice.actions
