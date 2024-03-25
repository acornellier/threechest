import { PayloadAction } from '@reduxjs/toolkit'
import { BaseAwarenessState } from '../../components/Collab/YRedux'
import { LatLng } from 'leaflet'
import { postAwarenessUpdateChecks } from './collabActions.ts'
import { useLocalStorage } from '../../hooks/useLocalStorage.ts'
import { createAppSlice, useRootSelector } from '../storeUtil.ts'

export type ClientType = 'host' | 'guest'

export interface AwarenessState extends BaseAwarenessState {
  name: string
  clientType?: ClientType
  promotingClientId?: number | null
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

export const getLocalAwareness = (state: CollabState) =>
  state.awarenessStates.find(({ isCurrentClient }) => isCurrentClient)

export const collabSlice = createAppSlice({
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
      window.history.replaceState({}, '', window.location.origin)
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
      if (localAwareness) postAwarenessUpdateChecks(state, localAwareness)
    },
    setAwarenessStates(state, { payload: awarenessStates }: PayloadAction<AwarenessState[]>) {
      state.awarenessStates = awarenessStates

      const localAwareness = getLocalAwareness(state)
      if (localAwareness) postAwarenessUpdateChecks(state, localAwareness)
    },
    promoteSelfToHost(state, _action: PayloadAction<boolean>) {
      const localAwareness = getLocalAwareness(state)
      if (localAwareness) localAwareness.clientType = 'host'
    },
    promoteGuestToHost(state, { payload: clientId }: PayloadAction<number>) {
      const localAwareness = getLocalAwareness(state)
      if (localAwareness) localAwareness.promotingClientId = clientId
    },
    setMousePosition(
      state,
      { payload: mousePosition }: PayloadAction<AwarenessState['mousePosition']>,
    ) {
      const localAwareness = getLocalAwareness(state)
      if (localAwareness) localAwareness.mousePosition = mousePosition
    },
    setCollabName(state, { payload: name }: PayloadAction<string>) {
      const localAwareness = getLocalAwareness(state)
      if (localAwareness) localAwareness.name = name
    },
    setCollabColor(state, { payload: color }: PayloadAction<string>) {
      const localAwareness = getLocalAwareness(state)
      if (localAwareness) localAwareness.color = color
    },
  },
  selectors: {
    selectAwarenessStates: (state) => state.awarenessStates,
    selectLocalAwareness: getLocalAwareness,
    selectLocalAwarenessIsGuest: (state): boolean =>
      collabSlice.getSelectors().selectLocalAwareness(state)?.clientType === 'guest',
    selectLocalAwarenessIsHost: (state): boolean =>
      collabSlice.getSelectors().selectLocalAwareness(state)?.clientType === 'host',
  },
})

export const useCollabSelector = <T>(selector: (state: CollabState) => T): T =>
  useRootSelector((state) => selector(state.collab))

export function useIsGuestCollab() {
  const active = useCollabSelector((state) => state.active)
  const isGuest = useRootSelector(selectLocalAwarenessIsGuest)
  return active && isGuest
}

export const useAwarenessStates = () => useRootSelector(selectAwarenessStates)
export const savedCollabNameKey = 'collab-name'
export const useSavedCollabName = () => useLocalStorage(savedCollabNameKey, '', false)
export const savedCollabColorKey = 'collab-color'
export const useSavedCollabColor = () => useLocalStorage(savedCollabColorKey, '', false)

export const collabReducer = collabSlice.reducer

export const {
  startCollab,
  endCollab,
  joinCollab,
  setWsConnected,
  setAwarenessStates,
  promoteSelfToHost,
  promoteGuestToHost,
  setMousePosition,
  setCollabName,
  setCollabColor,
} = collabSlice.actions

export const {
  selectAwarenessStates,
  selectLocalAwareness,
  selectLocalAwarenessIsGuest,
  selectLocalAwarenessIsHost,
} = collabSlice.selectors
