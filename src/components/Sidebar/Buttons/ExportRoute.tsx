import { Button } from '../../Common/Button.tsx'
import { useAppDispatch, useRoute } from '../../../store/hooks.ts'
import { exportRouteApi } from '../../../api/exportRouteApi.ts'
import { addToast } from '../../../store/reducers/toastReducer.ts'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useShortcut } from '../../../hooks/useShortcut.ts'
import { useCallback } from 'react'
import { shortcuts } from '../../../data/shortcuts.ts'

interface Props {
  hidden?: boolean
}

export function ExportRoute({ hidden }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const handleClick = useCallback(async () => {
    try {
      const str = await exportRouteApi(route)
      dispatch(addToast({ message: 'MDT string copied to clipboard!' }))
      return navigator.clipboard.writeText(str)
    } catch (err) {
      dispatch(addToast({ message: `Failed to export MDT string: ${err}`, type: 'error' }))
    }
  }, [dispatch, route])

  useShortcut(shortcuts.copy, handleClick)

  return (
    <Button
      Icon={ArrowDownTrayIcon}
      short
      className={`flex-1 ${hidden ? '[&]:hidden' : ''}`}
      onClick={handleClick}
      shortcut={{ key: 'C', ctrl: true }}
      justifyStart
    >
      Export MDT
    </Button>
  )
}
