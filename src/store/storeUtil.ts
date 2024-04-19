import type { TypedUseSelectorHook, UseStore} from 'react-redux';
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, RootState, store } from './store.ts'
import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit'

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore as UseStore<typeof store>
export const useAppDispatch: () => AppDispatch = useDispatch

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
})
