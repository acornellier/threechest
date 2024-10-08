import { Button } from '../../Common/Button.tsx'
import { exportRouteApi } from '../../../api/exportRouteApi.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { ShareIcon } from '@heroicons/react/24/outline'
import { useCallback, useState } from 'react'
import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { shareRouteApi } from '../../../api/shareRouteApi.ts'
import { copyText } from '../../../util/dev.ts'

interface Props {
  hidden?: boolean
}

export function ShareRoute({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(async () => {
    try {
      setLoading(true)
      const str = await exportRouteApi(route)
      const routeId = await shareRouteApi(route.uid, str)
      const url = window.location.origin + `?id=${routeId}`
      await copyText(url)
      dispatch(addToast({ message: 'URL copied to clipboard! URL is valid for 1 week.' }))
    } catch (err) {
      dispatch(addToast({ message: `Failed to share route: ${err}`, type: 'error' }))
    }
    setLoading(false)
  }, [dispatch, route])

  return (
    <Button
      Icon={ShareIcon}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      onClick={handleClick}
      disabled={loading}
    >
      Share
    </Button>
  )
}
