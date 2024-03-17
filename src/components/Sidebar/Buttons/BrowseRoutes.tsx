import { Dropdown, DropdownOption } from '../../Common/Dropdown.tsx'
import { useCallback, useMemo } from 'react'
import { Route } from '../../../util/types.ts'
import { sampleRoutes } from '../../../data/sampleRoutes/sampleRoutes.ts'
import { useAppDispatch, useDungeon } from '../../../store/hooks.ts'
import { setPreviewRouteAsync } from '../../../store/reducers/importReducer.ts'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { setRoute } from '../../../store/routes/routesReducer.ts'

interface SampleRouteOption extends DropdownOption {
  route: Route
}

export function BrowseRoutes() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()

  const options: SampleRouteOption[] = useMemo(
    () =>
      sampleRoutes[dungeon.key].map(({ route }) => ({
        label: route.name,
        id: route.uid,
        route: route,
      })),
    [dungeon.key],
  )

  const onSelect = useCallback(
    (option: SampleRouteOption) => dispatch(setRoute(option.route)),
    [dispatch],
  )

  const onHover = useCallback(
    (option: SampleRouteOption | null) => {
      dispatch(setPreviewRouteAsync(option ? { routeId: option.id, route: option.route } : null))
    },
    [dispatch],
  )

  return (
    <Dropdown
      short
      options={options}
      onSelect={onSelect}
      onHover={onHover}
      buttonText="Browse routes"
      MainButtonIcon={MagnifyingGlassIcon}
    />
  )
}
