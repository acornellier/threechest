import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

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

interface AddToastOptions {
  message: string
  type?: ToastType
  duration?: number
  isTip?: boolean
}

export const addToast = createAsyncThunk(
  'toast/addToast',
  async ({ message, type, duration, isTip }: AddToastOptions, thunkAPI) => {
    const toast: Toast = {
      id: new Date().getTime(),
      message,
      type: type ?? 'success',
      duration: duration ?? 5_000,
      isTip,
    }

    thunkAPI.dispatch(toastSlice.actions.newToast(toast))

    if (toast.duration === 0) return

    await new Promise((res) => setTimeout(res, toast.duration))
    thunkAPI.dispatch(toastSlice.actions.setToastRemoving(toast.id))

    await new Promise((res) => setTimeout(res, 1_000))
    thunkAPI.dispatch(removeToast(toast.id))
  },
)

export const toastReducer = toastSlice.reducer
