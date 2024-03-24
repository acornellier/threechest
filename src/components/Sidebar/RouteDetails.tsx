import { Panel } from '../Common/Panel.tsx'
import { ImportRoute } from './Buttons/ImportRoute.tsx'
import { NewRoute } from './Buttons/NewRoute.tsx'
import { DeleteRoute } from './Buttons/DeleteRoute.tsx'
import { DuplicateRoute } from './Buttons/DuplicateRoute.tsx'
import { SampleRoutes } from './Buttons/SampleRoutes.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'
import { RouteDropdown } from './RouteDropdown.tsx'
import { RenameRoute } from './Buttons/RenameRoute.tsx'
import { useCallback, useState } from 'react'
import { setName } from '../../store/routes/routesReducer.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { RenameRouteInput } from './Buttons/RenameRouteInput.tsx'
import { useActualRoute } from '../../store/routes/routeHooks.ts'

interface Props {
  collapsed?: boolean
}

export function RouteDetails({ collapsed }: Props) {
  const dispatch = useAppDispatch()
  const [isRenaming, setRenaming] = useState(false)
  const route = useActualRoute()
  const [input, setInput] = useState('')

  const open = useCallback(() => {
    setInput(route.name)
    setRenaming(true)
  }, [route.name, setRenaming])

  const close = useCallback(() => {
    dispatch(setName(input))
    setRenaming(false)
  }, [dispatch, input, setRenaming])

  const onClickRename = useCallback(() => {
    if (isRenaming) close()
    else open()
  }, [close, isRenaming, open])

  return (
    <Panel noRightBorder>
      <div className="flex gap-2 pointer-events-auto">
        {isRenaming ? (
          <RenameRouteInput input={input} setInput={setInput} onClose={close} />
        ) : (
          <RouteDropdown />
        )}
      </div>
      <div className={`flex gap-2 ${collapsed ? 'hidden' : ''}`}>
        <RenameRoute isRenaming={isRenaming} onClickRename={onClickRename} />
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
