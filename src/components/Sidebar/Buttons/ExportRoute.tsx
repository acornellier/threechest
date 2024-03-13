import { Button } from '../../Common/Button.tsx'
import { useAppDispatch, useRoute } from '../../../store/hooks.ts'
import { exportRouteApi } from '../../../api/exportRouteApi.ts'
import { addToast } from '../../../store/toastReducer.ts'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useShortcut } from '../../../hooks/useShortcut.ts'
import { useCallback } from 'react'
import { shortcuts } from '../../../data/shortcuts.ts'

export function ExportRoute() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = useCallback(async () => {
    try {
      const str = await exportRouteApi(route)
      addToast(dispatch, 'MDT string copied to clipboard!')
      return navigator.clipboard.writeText(str)
    } catch (err) {
      addToast(dispatch, `Failed to export MDT string: ${err}`, 'error')
    }
  }, [dispatch, route])

  useShortcut(shortcuts.copy, handleClick)

  return (
    <Button
      Icon={ArrowDownTrayIcon}
      short
      className="flex-1"
      onClick={handleClick}
      shortcut={{ key: 'C', ctrl: true }}
    >
      Export MDT
    </Button>
  )
}
