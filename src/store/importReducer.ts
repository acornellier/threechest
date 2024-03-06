import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { MdtRoute } from '../code/types.ts'

export interface ImportState {
  importingRoute: MdtRoute | null
}

const initialState: ImportState = {
  importingRoute: null,
}

export const importSlice = createSlice({
  name: 'import',
  initialState,
  reducers: {
    setImportingRoute(state, { payload }: PayloadAction<MdtRoute>) {
      state.importingRoute = payload
    },
    clearImportingRoute(state) {
      state.importingRoute = null
    },
  },
})

export const importReducer = importSlice.reducer

export const { setImportingRoute, clearImportingRoute } = importSlice.actions
