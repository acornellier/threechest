import { sleep } from '../../util/dev.ts'

import { createAppSlice } from '../storeUtil.ts'

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

export const toastSlice = createAppSlice({
  name: 'toast',
  initialState,
  reducers: (create) => ({
    newToast: create.reducer<Toast>((state, { payload: toast }) => {
      state.toasts.push(toast)
    }),
    setToastRemoving: create.reducer<number>((state, { payload: id }) => {
      const toast = state.toasts.find((toast) => toast.id === id)
      if (toast) toast.removing = true
    }),
    removeToast: create.reducer<number>((state, { payload: id }) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== id)
    }),
    addToast: create.asyncThunk(
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

        await sleep(toast.duration)
        thunkAPI.dispatch(toastSlice.actions.setToastRemoving(toast.id))

        await sleep(1_000)
        thunkAPI.dispatch(removeToast(toast.id))
      },
    ),
  }),
})

export const { removeToast, addToast } = toastSlice.actions

interface AddToastOptions {
  message: string
  type?: ToastType
  duration?: number
  isTip?: boolean
}

export const toastReducer = toastSlice.reducer
