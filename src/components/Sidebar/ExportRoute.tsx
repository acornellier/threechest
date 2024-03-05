import { Button } from '../Common/Button.tsx'
import { useRoute } from '../../store/hooks.ts'
import { useToasts } from '../Toast/useToasts.ts'
import { exportRoute } from '../../api/exportRoute.ts'

export function ExportRoute() {
  const route = useRoute()

  const { addToast } = useToasts()

  const handleClick = () => {
    exportRoute(route).then((str) => {
      addToast('MDT string copied to clipboard!')
      return navigator.clipboard.writeText(str)
    })
  }

  return (
    <Button short className="flex-1" onClick={handleClick}>
      Export MDT
    </Button>
  )
}
