import { Panel } from '../Common/Panel.tsx'
import { RouteName } from './RouteName.tsx'
import { ImportRoute } from './ImportRoute.tsx'
import { NewRoute } from './NewRoute.tsx'

export function RouteDetails() {
  return (
    <Panel>
      <RouteName />
      <div className="flex gap-2">
        <NewRoute />
        <ImportRoute />
      </div>
    </Panel>
  )
}
