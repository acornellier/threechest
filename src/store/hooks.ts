import { TypedUseSelectorHook, useDispatch, useSelector, UseStore, useStore } from 'react-redux'
import { AppDispatch, RootState, store } from './store.ts'

export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore = useStore as UseStore<typeof store>
export const useAppDispatch: () => AppDispatch = useDispatch
