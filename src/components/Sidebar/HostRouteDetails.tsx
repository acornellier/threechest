import { Panel } from '../Common/Panel.tsx'
import { Button } from '../Common/Button.tsx'
import { useRoute } from '../../store/hooks.ts'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export function HostRouteDetails() {
  const route = useRoute()

  return (
    <Panel noRightBorder>
      <Button disabled>
        <div className="overflow-hidden text-ellipsis whitespace-nowrap">{route.name}</div>
      </Button>
      <Button Icon={ArrowPathIcon} short>
        Sync to local
      </Button>
      <div className="flex gap-1">
        <ExportRoute />
        <ShareRoute />
      </div>
    </Panel>
  )
}
