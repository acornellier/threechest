import { Panel } from '../Common/Panel.tsx'
import { ImportRoute } from './Buttons/ImportRoute.tsx'
import { NewRoute } from './Buttons/NewRoute.tsx'
import { RouteDropdown } from './RouteDropdown.tsx'
import { DeleteRoute } from './Buttons/DeleteRoute.tsx'
import { DuplicateRoute } from './Buttons/DuplicateRoute.tsx'
import { RenameRoute } from './Buttons/RenameRoute.tsx'
import { useState } from 'react'
import { SampleRoutes } from './Buttons/SampleRoutes.tsx'

export function RouteDetails() {
  const [isRenaming, setRenaming] = useState(false)

  return (
    <Panel noRightBorder>
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
      <SampleRoutes />
    </Panel>
  )
}
