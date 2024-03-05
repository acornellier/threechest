import { Button } from '../Common/Button.tsx'
import { exportRoute } from '../../api/exportRoute.ts'
import { useRoute } from '../../store/hooks.ts'
import { useToasts } from '../Toast/useToasts.ts'

export function ShareRoute() {
  const route = useRoute()

  const { addToast } = useToasts()

  const handleClick = () => {
    exportRoute(route).then((str) => {
      addToast('URL copied to clipboard!')
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
