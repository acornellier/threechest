import { Button } from '../../Common/Button.tsx'
import { exportRouteApi } from '../../../api/exportRouteApi.ts'
import { useAppDispatch, useRoute } from '../../../store/hooks.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { ShareIcon } from '@heroicons/react/24/outline'
import { useCallback } from 'react'

export function ShareRoute() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = useCallback(async () => {
    try {
      const str = await exportRouteApi(route)
      const url = window.location.host + `?mdt=${str}`
      await navigator.clipboard.writeText(url)
      dispatch(addToast({ message: 'URL copied to clipboard!' }))
    } catch (err) {
      dispatch(addToast({ message: `Failed to export MDT string: ${err}`, type: 'error' }))
    }
  }, [dispatch, route])

  return (
    <Button Icon={ShareIcon} short className="flex-1" onClick={handleClick}>
      Share
    </Button>
  )
}
