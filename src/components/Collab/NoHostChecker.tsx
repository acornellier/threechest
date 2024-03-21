import { useAppDispatch, useAppStore } from '../../store/hooks.ts'
import { useEffect } from 'react'
import { shouldPromoteToHost } from '../../store/reducers/collabActions.ts'
import { promoteToHost } from '../../store/reducers/collabReducer.ts'

export function NoHostChecker() {
  const dispatch = useAppDispatch()
  const store = useAppStore()

  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldPromoteToHost(store.getState().collab)) dispatch(promoteToHost())
    }, 1000)

    return () => clearInterval(interval)
  }, [dispatch, store])

  return null
}