import { Button } from '../../Common/Button.tsx'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useShortcut } from '../../../util/hooks/useShortcut.ts'
import { useCallback } from 'react'
import { shortcuts } from '../../../data/shortcuts.ts'
import { useRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { exportRouteApi } from '../../../api/exportRouteApi.ts'
import { copyText } from '../../../util/dev.ts'

interface Props {
  hidden?: boolean
}

export function ExportRoute({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = useCallback(async () => {
    try {
      const str = await exportRouteApi(route)
      await copyText(str)
      dispatch(addToast({ message: 'MDT string copied to clipboard!' }))
    } catch (err) {
      dispatch(addToast({ message: `Failed to export route: ${err}`, type: 'error' }))
    }
  }, [dispatch, route])

  useShortcut(shortcuts.exportRoute, handleClick)

  return (
    <Button
      Icon={ArrowDownTrayIcon}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      onClick={handleClick}
      shortcut={shortcuts.exportRoute[0]}
      justifyStart
    >
      Export MDT
    </Button>
  )
}
