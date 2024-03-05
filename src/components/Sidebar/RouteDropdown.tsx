import { useMemo } from 'react'
import { useAppDispatch, useDungeonRoutes, useRoute } from '../../store/hooks.ts'
import { loadRoute } from '../../store/routesReducer.ts'
import { SavedRoute } from '../../code/types.ts'
import { Dropdown, DropdownOption } from '../Common/Dropdown.tsx'

const routeToOption = (route: SavedRoute): DropdownOption => ({
  id: route.uid,
  label: route.name,
})

export function RouteDropdown() {
  const dispatch = useAppDispatch()
  const route = useRoute()
  const routes = useDungeonRoutes(route.dungeonKey)

  const options = useMemo(() => routes.map(routeToOption), [routes])
  const selected = useMemo(
    () => options.find((option) => option.id === route.uid),
    [options, route.uid],
  )

  return (
    <Dropdown
      options={options}
      selected={selected}
      onChange={(option) => dispatch(loadRoute(option.id))}
    />
  )
}
