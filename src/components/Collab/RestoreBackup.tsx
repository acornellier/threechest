import { Button } from '../Common/Button.tsx'
import { CloudArrowDownIcon } from '@heroicons/react/24/outline'
import { useRoutesSelector } from '../../store/routes/routeHooks.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'
import { useCallback } from 'react'
import { setRouteForCollab } from '../../store/routes/routesReducer.ts'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'

export function RestoreBackup() {
  const dispatch = useAppDispatch()
  const backupRoute = useRoutesSelector((state) => state.collabBackupRoute)
  const isGuestCollab = useIsGuestCollab()

  const onRestoreBackup = useCallback(() => {
    if (!backupRoute) return
    dispatch(setRouteForCollab(backupRoute))
    dispatch(addToast({ message: `Route restored from backup` }))
  }, [backupRoute, dispatch])

  if (!backupRoute || isGuestCollab) return

  return (
    <div className="flex gap-1">
      <Button
        Icon={CloudArrowDownIcon}
        short
        outline
        onClick={onRestoreBackup}
        className="w-full"
        tooltip="Restores the route to the point when you opened this route during the collab."
        tooltipId="collab-restore-route-tooltip"
      >
        Restore
      </Button>
    </div>
  )
}
