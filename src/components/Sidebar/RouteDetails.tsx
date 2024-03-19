import { Panel } from '../Common/Panel.tsx'
import { ImportRoute } from './Buttons/ImportRoute.tsx'
import { NewRoute } from './Buttons/NewRoute.tsx'
import { RouteDropdown } from './RouteDropdown.tsx'
import { DeleteRoute } from './Buttons/DeleteRoute.tsx'
import { DuplicateRoute } from './Buttons/DuplicateRoute.tsx'
import { RenameRoute } from './Buttons/RenameRoute.tsx'
import { useCallback, useState } from 'react'
import { SampleRoutes } from './Buttons/SampleRoutes.tsx'

interface Props {
  collapsed?: boolean
}

export function RouteDetails({ collapsed }: Props) {
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [isRenaming, setRenaming] = useState(false)

  const onDropdownOpen = useCallback(() => setDropdownOpen(true), [])
  const onDropdownClose = useCallback(() => setDropdownOpen(false), [])

  return (
    <Panel noRightBorder>
      <div className="flex gap-2">
        {!isRenaming && <RouteDropdown onOpen={onDropdownOpen} onClose={onDropdownClose} />}
        {!isDropdownOpen && (
          <RenameRoute isRenaming={isRenaming} setRenaming={setRenaming} hidden={collapsed} />
        )}
      </div>
      <div className={`flex gap-2 ${collapsed ? 'hidden' : ''}`}>
        <NewRoute />
        <DuplicateRoute />
        <DeleteRoute />
      </div>
      <ImportRoute hidden={collapsed} />
      <SampleRoutes hidden={collapsed} />
    </Panel>
  )
}
