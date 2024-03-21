import { Panel } from '../Common/Panel.tsx'
import { Button } from '../Common/Button.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'
import { ArchiveBoxArrowDownIcon, CheckIcon } from '@heroicons/react/24/outline'

import { useRoute } from '../../store/routes/routeHooks.ts'
import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { saveRoute, updateSavedRoutes } from '../../store/routes/routesReducer.ts'

interface Props {
  collapsed?: boolean
}

export function HostRouteDetails({ collapsed }: Props) {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(false)
  }, [route])

  const onSave = useCallback(async () => {
    dispatch(updateSavedRoutes())
    await saveRoute(route)
    setSaved(true)
  }, [dispatch, route])

  return (
    <Panel noRightBorder>
      <Button disabled>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">{route.name}</div>
      </Button>
      <Button
        Icon={saved ? CheckIcon : ArchiveBoxArrowDownIcon}
        short
        onClick={onSave}
        disabled={saved}
        className={`${collapsed ? '[&]:hidden' : ''}`}
      >
        {saved ? 'Saved locally' : 'Save locally'}
      </Button>
      <div className={`flex gap-1 ${collapsed ? 'hidden' : ''}`}>
        <ExportRoute />
        <ShareRoute />
      </div>
    </Panel>
  )
}
