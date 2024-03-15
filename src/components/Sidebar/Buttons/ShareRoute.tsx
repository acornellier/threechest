import { Button } from '../../Common/Button.tsx'
import { exportRouteApi } from '../../../api/exportRouteApi.ts'
import { useAppDispatch, useRoute } from '../../../store/hooks.ts'
import { addToast } from '../../../store/toastReducer.ts'
import { ShareIcon } from '@heroicons/react/24/outline'

export function ShareRoute() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = async () => {
    try {
      const str = await exportRouteApi(route)
      dispatch(addToast({ message: 'URL copied to clipboard!' }))
      const url = window.location.host + `?mdt=${str}`
      return navigator.clipboard.writeText(url)
    } catch (err) {
      dispatch(addToast({ message: `Failed to export MDT string: ${err}`, type: 'error' }))
    }
  }

  return (
    <Button outline Icon={ShareIcon} short className="flex-1" onClick={handleClick}>
      Share URL
    </Button>
  )
}
