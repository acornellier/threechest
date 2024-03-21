import { Panel } from '../Common/Panel.tsx'
import { ImportRoute } from './Buttons/ImportRoute.tsx'
import { NewRoute } from './Buttons/NewRoute.tsx'
import { DeleteRoute } from './Buttons/DeleteRoute.tsx'
import { DuplicateRoute } from './Buttons/DuplicateRoute.tsx'
import { SampleRoutes } from './Buttons/SampleRoutes.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'

interface Props {
  collapsed?: boolean
}

export function RouteDetails({ collapsed }: Props) {
  return (
    <Panel noRightBorder>
      <div className={`flex gap-2 ${collapsed ? 'hidden' : ''}`}>
        <NewRoute />
        <DuplicateRoute />
        <DeleteRoute />
      </div>
      <SampleRoutes hidden={collapsed} />
      <ImportRoute hidden={collapsed} />
      <div className={`flex gap-1 ${collapsed ? '[&]:hidden' : ''}`}>
        <ExportRoute hidden={collapsed} />
        <ShareRoute hidden={collapsed} />
      </div>
    </Panel>
  )
}
