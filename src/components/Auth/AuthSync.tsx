import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../store/firestore.ts'
import { setUser } from '../../store/reducers/cloudReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { pullChangedRoutes } from '../../store/routes/routeCloudThunks.ts'

export function AuthSync() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    let previousUid: string | null = null
    return onAuthStateChanged(auth, (user) => {
      const isSignIn = user !== null && previousUid === null
      previousUid = user?.uid ?? null
      dispatch(setUser(user))
      if (isSignIn) {
        dispatch(pullChangedRoutes(user!.uid)).catch(console.error)
      }
    })
  }, [dispatch])

  return null
}
