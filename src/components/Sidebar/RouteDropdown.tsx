import { useCallback, useMemo } from 'react'
import { loadRoute } from '../../store/routes/routesReducer.ts'
import { SavedRoute } from '../../util/types.ts'
import { Dropdown, DropdownOption } from '../Common/Dropdown.tsx'
import { setPreviewRouteAsync } from '../../store/reducers/importReducer.ts'
import { useActualRoute, useDungeonRoutes } from '../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'

const routeToOption = (route: SavedRoute): DropdownOption => ({
  id: route.uid,
  content: route.name,
})

interface Props {
  onOpen?: () => void
  onClose?: () => void
}

export function RouteDropdown({ onOpen, onClose }: Props) {
  const dispatch = useAppDispatch()
  const route = useActualRoute()
  const routes = useDungeonRoutes(route.dungeonKey)
  const isGuestCollab = useIsGuestCollab()

  const options = useMemo(() => routes.map(routeToOption), [routes])
  const selected = useMemo(
    () => options.find((option) => option.id === route.uid),
    [options, route.uid],
  )

  const onSelect = useCallback(
    async (option: DropdownOption) => {
      dispatch(setPreviewRouteAsync(null))
      dispatch(loadRoute(option.id))
    },
    [dispatch],
  )

  const onHover = useCallback(
    async (option: DropdownOption | null) => {
      dispatch(setPreviewRouteAsync(option ? { routeId: option.id } : null))
    },
    [dispatch],
  )

  return (
    <Dropdown
      className="dungeon-dropdown"
      options={options}
      selected={selected}
      onSelect={onSelect}
      onHover={onHover}
      onOpen={onOpen}
      onClose={onClose}
      disabled={isGuestCollab}
    />
  )
}
