import { Button } from '../../Common/Button.tsx'
import { useAppDispatch, useRoute } from '../../../store/hooks.ts'
import { exportRouteApi } from '../../../api/exportRouteApi.ts'
import { addToast } from '../../../store/toastReducer.ts'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

export function ExportRoute() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = async () => {
    try {
      const str = await exportRouteApi(route)
      addToast(dispatch, 'MDT string copied to clipboard!')
      return navigator.clipboard.writeText(str)
    } catch (err) {
      addToast(dispatch, `Failed to export MDT string: ${err}`, 'error')
    }
  }

  return (
    <Button Icon={ArrowDownTrayIcon} short className="flex-1" onClick={handleClick}>
      Export MDT
    </Button>
  )
}
