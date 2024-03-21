import { TypedUseSelectorHook, useDispatch, useSelector, UseStore, useStore } from 'react-redux'
import { AppDispatch, RootState, store } from './store.ts'
import { asyncThunkCreator, buildCreateSlice } from '@reduxjs/toolkit'

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore as UseStore<typeof store>
export const useAppDispatch: () => AppDispatch = useDispatch

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
})
