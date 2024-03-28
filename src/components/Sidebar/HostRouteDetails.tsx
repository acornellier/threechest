import { Panel } from '../Common/Panel.tsx'
import { Button } from '../Common/Button.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'
import { ArchiveBoxArrowDownIcon, CheckIcon } from '@heroicons/react/24/outline'

import { useRoute, useSavedRoutes } from '../../store/routes/routeHooks.ts'
import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { saveRoute, updateSavedRoutes } from '../../store/routes/routesReducer.ts'
import { RouteDropdown } from './RouteDropdown.tsx'

interface Props {
  collapsed?: boolean
}

export function HostRouteDetails({ collapsed }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const savedRoutes = useSavedRoutes()
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    if (!savedRoutes.some(({ uid }) => route.uid === uid)) setSaved(false)
  }, [route, savedRoutes])

  const onSave = useCallback(async () => {
    dispatch(updateSavedRoutes())
    await saveRoute(route)
    setSaved(true)
  }, [dispatch, route])

  return (
    <Panel noRightBorder>
      <RouteDropdown />
      <Button
        Icon={saved ? CheckIcon : ArchiveBoxArrowDownIcon}
        short
        onClick={onSave}
        disabled={saved}
        className={`${collapsed ? '[&]:hidden' : ''}`}
        tooltip={
          saved
            ? 'Any changes to this route will be saved for you'
            : 'Changes to this route are not currently being saved for you. They will be saved if you leave the collab while the route is active or click this button.'
        }
        tooltipId="save-host-route-locally-tooltip"
      >
        {saved ? 'Route saved' : "Save host's route locally"}
      </Button>
      <div className={`flex gap-1 ${collapsed ? 'hidden' : ''}`}>
        <ExportRoute />
        <ShareRoute />
      </div>
    </Panel>
  )
}
