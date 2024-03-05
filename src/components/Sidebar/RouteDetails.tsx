import { Panel } from '../Common/Panel.tsx'
import { ImportRoute } from './ImportRoute.tsx'
import { NewRoute } from './NewRoute.tsx'
import { RouteDropdown } from './RouteDropdown.tsx'
import { DeleteRoute } from './DeleteRoute.tsx'

export function RouteDetails() {
  return (
    <Panel>
      <RouteDropdown />
      <div className="flex gap-2">
        <NewRoute />
        <ImportRoute />
      </div>
      <DeleteRoute />
    </Panel>
  )
}
