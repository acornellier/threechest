import { useEffect } from 'react'
import { shouldPromoteToHost } from '../../store/collab/collabActions.ts'
import { promoteSelfToHost } from '../../store/collab/collabReducer.ts'
import { useAppDispatch, useAppStore } from '../../store/storeUtil.ts'

export function NoHostChecker() {
  const dispatch = useAppDispatch()
  const store = useAppStore()

  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldPromoteToHost(store.getState().collab)) dispatch(promoteSelfToHost(true))
    }, 1000)

    return () => clearInterval(interval)
  }, [dispatch, store])

  return null
}
