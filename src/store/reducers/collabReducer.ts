import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'
import { LatLng } from 'leaflet'
import { getPullColor } from '../../util/colors.ts'

export type ClientType = 'host' | 'guest'

export interface AwarenessState extends BaseAwarenessState {
  clientType: ClientType
  joinTime: number
  color?: string
  mousePosition?: LatLng | null
}

export interface CollabState {
  active: boolean
  room: string
  startedCollab: boolean
  awarenessStates: AwarenessState[]
}

const initialState: CollabState = {
  active: false,
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
    },
    endCollab(state) {
      state.active = false
      state.startedCollab = false
    },
    joinCollab(state, { payload: room }: PayloadAction<string>) {
      state.active = true
      state.room = room
      state.startedCollab = false
    },
    setAwarenessStates(state, { payload: awarenessStates }: PayloadAction<AwarenessState[]>) {
      state.awarenessStates = awarenessStates

      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      const clashingColor = state.awarenessStates.some(
        (other) => !other.isCurrentClient && other.color === localAwareness.color,
      )

      if (localAwareness.color && !clashingColor) return

      const joinIndex = state.awarenessStates
        .sort((a, b) => a.joinTime - b.joinTime)
        .findIndex(({ isCurrentClient }) => isCurrentClient)

      localAwareness.color = getPullColor(joinIndex)
    },
    setMousePosition(
      state,
      { payload: mousePosition }: PayloadAction<AwarenessState['mousePosition']>,
    ) {
      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      localAwareness.mousePosition = mousePosition
    },
  },
})

export const collabReducer = collabSlice.reducer

export const { startCollab, endCollab, joinCollab, setAwarenessStates, setMousePosition } =
  collabSlice.actions
