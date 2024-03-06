import { Button } from '../Common/Button.tsx'
import { exportRoute } from '../../api/exportRoute.ts'
import { useAppDispatch, useRoute } from '../../store/hooks.ts'
import { addToast } from '../../store/toastReducer.ts'

export function ShareRoute() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = () => {
    exportRoute(route).then((str) => {
      addToast(dispatch, 'URL copied to clipboard!')
      const url = window.location.host + `?mdt=${str}`
      return navigator.clipboard.writeText(url)
    })
  }

  return (
    <Button short className="flex-1" onClick={handleClick}>
      Share URL
    </Button>
  )
}
