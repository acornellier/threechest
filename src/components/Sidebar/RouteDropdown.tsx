import { useCallback, useMemo } from 'react'
import { useActualRoute, useAppDispatch, useDungeonRoutes } from '../../store/hooks.ts'
import { loadRoute } from '../../store/routes/routesReducer.ts'
import { SavedRoute } from '../../util/types.ts'
import { Dropdown, DropdownOption } from '../Common/Dropdown.tsx'
import { setPreviewRouteAsync } from '../../store/reducers/importReducer.ts'

const routeToOption = (route: SavedRoute): DropdownOption => ({
  id: route.uid,
  content: route.name,
})

interface Props {
  onOpen: () => void
  onClose: () => void
}

export function RouteDropdown({ onOpen, onClose }: Props) {
  const dispatch = useAppDispatch()
  const route = useActualRoute()
  const routes = useDungeonRoutes(route.dungeonKey)

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
      options={options}
      selected={selected}
      onSelect={onSelect}
      onHover={onHover}
      onOpen={onOpen}
      onClose={onClose}
    />
  )
}
