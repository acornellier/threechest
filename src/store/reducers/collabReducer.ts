import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'
import { LatLng } from 'leaflet'
import { highContrastColors } from '../../util/colors.ts'
import { RootState } from '../store.ts'
import { sleep } from '../../util/dev.ts'
import { savedCollabColorKey, savedCollabNameKey } from '../hooks.ts'

export type ClientType = 'host' | 'guest'

export interface AwarenessState extends BaseAwarenessState {
  name: string
  clientType: ClientType
  joinTime: number
  color: string | null
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
  const clashingColor =
    state.awarenessStates.length < highContrastColors.length &&
    state.awarenessStates.some(
      (awareness) =>
        !awareness.isCurrentClient &&
        awareness.color === localAwareness.color &&
        awareness.joinTime < localAwareness.joinTime,
    )

  if (localAwareness.color && !clashingColor) return

  const takenColors = state.awarenessStates.map(({ color }) => color)
  const availableColors = highContrastColors.filter((color) => !takenColors.includes(color))
  const colors = availableColors.length ? availableColors : highContrastColors
  localAwareness.color = colors[Math.floor(Math.random() * colors.length)]!
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

export const setInitialAwareness = createAsyncThunk(
  'collab/setInitialAwareness',
  async (localAwareness: AwarenessState, thunkAPI) => {
    let state = thunkAPI.getState() as RootState
    if (state.collab.startedCollab) localAwareness.clientType = 'host'

    const savedName = localStorage.getItem(savedCollabNameKey)
    if (savedName) localAwareness.name = savedName

    const savedColor = localStorage.getItem(savedCollabColorKey)
    if (savedColor) localAwareness.color = savedColor

    thunkAPI.dispatch(setAwarenessStates([localAwareness]))

    if (localAwareness.clientType === 'host') return

    // Wait 1 second. If room is still empty, promote yourself to host
    await sleep(1000)

    state = thunkAPI.getState() as RootState
    if (state.collab.awarenessStates.length === 1) thunkAPI.dispatch(promoteToHost())
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
    setAwarenessStates(state, { payload: awarenessStates }: PayloadAction<AwarenessState[]>) {
      state.awarenessStates = awarenessStates

      const localAwareness = getLocalAwareness(state)
      if (!localAwareness) return
      setAwarenessColor(state, localAwareness)

      if (awarenessStates.length === 1 && localAwareness.clientType !== 'host') return
      checkForNoHost(state, localAwareness)
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
  setAwarenessStates,
  promoteToHost,
  setMousePosition,
  setCollabName,
  setCollabColor,
} = collabSlice.actions
