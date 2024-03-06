import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useRoute } from '../../store/hooks.ts'
import { exportRoute } from '../../api/exportRoute.ts'
import { addToast } from '../../store/toastReducer.ts'

export function ExportRoute() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = () => {
    exportRoute(route).then((str) => {
      addToast(dispatch, 'MDT string copied to clipboard!')
      return navigator.clipboard.writeText(str)
    })
  }

  return (
    <Button short className="flex-1" onClick={handleClick}>
      Export MDT
    </Button>
  )
}
