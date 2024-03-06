import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from './store.ts'

type ToastType = 'success' | 'error'

export interface Toast {
  id: number
  message: string
  type: ToastType
  removing?: boolean
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

export function addToast(dispatch: AppDispatch, message: string, type?: ToastType) {
  const toast: Toast = {
    id: new Date().getTime(),
    message,
    type: type ?? 'success',
  }

  dispatch(toastSlice.actions.newToast(toast))

  setTimeout(() => {
    dispatch(toastSlice.actions.setToastRemoving(toast.id))

    setTimeout(() => {
      dispatch(toastSlice.actions.removeToast(toast.id))
    }, 1_000)
  }, 5_000)
}

export const toastReducer = toastSlice.reducer

// export const {  } = toastSlice.actions
