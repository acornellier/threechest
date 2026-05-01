import { type PayloadAction } from '@reduxjs/toolkit'
import type { User } from 'firebase/auth'
import { createAppSlice } from '../storeUtil.ts'

type SyncState = 'idle' | 'dirty' | 'syncing'

type CloudState = {
  user: User | null
  syncState: SyncState
}

const initialState: CloudState = {
  user: null,
  syncState: 'idle',
}

export const cloudSlice = createAppSlice({
  name: 'cloud',
  initialState,
  reducers: {
    setUser(state, { payload: user }: PayloadAction<User | null>) {
      state.user = user
    },
    setSyncState(state, { payload: syncState }: PayloadAction<SyncState>) {
      state.syncState = syncState
    },
  },
  selectors: {
    selectUser: (state) => state.user,
    selectSyncState: (state) => state.syncState,
  },
})

export const cloudReducer = cloudSlice.reducer
export const { setUser, setSyncState } = cloudSlice.actions
export const { selectUser, selectSyncState } = cloudSlice.selectors
