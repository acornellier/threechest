import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from './store.ts'

type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
  duration: number
  removing?: boolean
  isTip?: boolean
}

export interface ToastState {
  toasts: Toast[]
}

const initialState: ToastState = {
  toasts: [],
}
export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    newToast(state, { payload: toast }: PayloadAction<Toast>) {
      state.toasts.push(toast)
    },
    setToastRemoving(state, { payload: id }: PayloadAction<number>) {
      const toast = state.toasts.find((toast) => toast.id === id)
      if (toast) toast.removing = true
    },
    removeToast(state, { payload: id }: PayloadAction<number>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== id)
    },
  },
})

export const { removeToast } = toastSlice.actions

export function addToast(
  dispatch: AppDispatch,
  message: string,
  type?: ToastType,
  duration?: number,
  isTip?: boolean,
) {
  const toast: Toast = {
    id: new Date().getTime(),
    message,
    type: type ?? 'success',
    duration: duration ?? 5_000,
    isTip,
  }

  dispatch(toastSlice.actions.newToast(toast))

  if (toast.duration !== 0) {
    setTimeout(() => {
      dispatch(toastSlice.actions.setToastRemoving(toast.id))

      setTimeout(() => {
        dispatch(removeToast(toast.id))
      }, 1_000)
    }, toast.duration)
  }
}

export const toastReducer = toastSlice.reducer
