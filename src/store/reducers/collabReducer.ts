import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'
import { LatLng } from 'leaflet'
import { darkHighContrastColors } from '../../util/colors.ts'

export type ClientType = 'host' | 'guest'

export interface AwarenessState extends BaseAwarenessState {
  name: string
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

function setAwarenessColor(state: CollabState, localAwareness: AwarenessState) {
  // Check for another client with the same as color as me who joined earlier
  const clashingColor = state.awarenessStates.some(
    (awareness) =>
      !awareness.isCurrentClient &&
      awareness.color === localAwareness.color &&
      awareness.joinTime < localAwareness.joinTime,
  )

  if (localAwareness.color && !clashingColor) return

  const takenColors = state.awarenessStates.map(({ color }) => color)
  const availableColors = darkHighContrastColors.filter((color) => !takenColors.includes(color))
  const colors = availableColors.length ? availableColors : darkHighContrastColors
  localAwareness.color = colors[Math.floor(Math.random() * colors.length)]
}

function checkForNoHost(state: CollabState, localAwareness: AwarenessState) {
  // Check for any hosts
  if (state.awarenessStates.some(({ clientType }) => clientType === 'host')) return

  // Check for another client who joined earlier than me
  if (
    state.awarenessStates.some(
      ({ isCurrentClient, joinTime }) => !isCurrentClient && joinTime < localAwareness.joinTime,
    )
  )
    return

  localAwareness.clientType = 'host'
}

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
    setInitialAwareness(state, { payload: localAwareness }: PayloadAction<AwarenessState>) {
      state.awarenessStates = [localAwareness]
    },
    setAwarenessStates(state, { payload: awarenessStates }: PayloadAction<AwarenessState[]>) {
      console.log('setAwarenessStates', awarenessStates)
      state.awarenessStates = awarenessStates

      if (!state.startedCollab && awarenessStates.length === 1) return

      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return

      setAwarenessColor(state, localAwareness)
      checkForNoHost(state, localAwareness)
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

export const {
  startCollab,
  endCollab,
  joinCollab,
  setInitialAwareness,
  setAwarenessStates,
  setMousePosition,
} = collabSlice.actions
