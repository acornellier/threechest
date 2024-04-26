import { useCallback, useMemo } from 'react'
import { loadRoute, setCurDungeonSavedRoutes } from '../../store/routes/routesReducer.ts'
import type { SavedRoute } from '../../util/types.ts'
import type { DropdownOption } from '../Common/Dropdown.tsx'
import { Dropdown } from '../Common/Dropdown.tsx'
import { setPreviewRouteAsync } from '../../store/reducers/importReducer.ts'
import { useActualRoute, useDungeonRoutes } from '../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../store/storeUtil.ts'
import { useIsGuestCollab } from '../../store/collab/collabReducer.ts'

interface RouteOption extends DropdownOption {
  route: SavedRoute
}

const routeToOption = (route: SavedRoute): RouteOption => ({
  id: route.uid,
  content: route.name,
  route,
})

export function RouteDropdown() {
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

  const onReorder = useCallback(
    (options: RouteOption[]) => {
      dispatch(setCurDungeonSavedRoutes(options.map((option) => option.route)))
    },
    [dispatch],
  )

  return (
    <Dropdown
      className="route-dropdown"
      options={options}
      selected={selected}
      onSelect={onSelect}
      onHover={onHover}
      onReorder={onReorder}
      buttonContent={isGuestCollab ? route.name : undefined}
      disabled={isGuestCollab}
    />
  )
}
