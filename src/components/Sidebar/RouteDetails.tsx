import { Panel } from '../Common/Panel.tsx'
import { ImportRoute } from './ImportRoute.tsx'
import { NewRoute } from './NewRoute.tsx'
import { RouteDropdown } from './RouteDropdown.tsx'
import { DeleteRoute } from './DeleteRoute.tsx'
import { DuplicateRoute } from './DuplicateRoute.tsx'
import { RenameRoute } from './RenameRoute.tsx'
import { useState } from 'react'

export function RouteDetails() {
  const [isRenaming, setRenaming] = useState(false)

  return (
    <Panel>
      <div className="flex gap-2">
        {!isRenaming && <RouteDropdown />}
        <RenameRoute isRenaming={isRenaming} setRenaming={setRenaming} />
      </div>
      <div className="flex gap-2">
        <NewRoute />
        <DuplicateRoute />
        <DeleteRoute />
      </div>
      <ImportRoute />
    </Panel>
  )
}
