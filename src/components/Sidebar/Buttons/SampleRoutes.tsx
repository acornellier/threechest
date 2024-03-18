import { Dropdown, DropdownOption } from '../../Common/Dropdown.tsx'
import { ReactNode, useCallback, useMemo } from 'react'
import { Route } from '../../../util/types.ts'
import { sampleRoutes } from '../../../data/sampleRoutes/sampleRoutes.ts'
import { useAppDispatch, useDungeon, useIsGuestCollab } from '../../../store/hooks.ts'
import { setPreviewRouteAsync } from '../../../store/reducers/importReducer.ts'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { setRoute } from '../../../store/routes/routesReducer.ts'

interface SampleRouteOption extends DropdownOption {
  route: Route
}

function SampleRouteChip({ children }: { children: ReactNode }) {
  return <div className="rounded-sm px-1 bg-cyan-800 text-xs">{children}</div>
}

export function SampleRoutes() {
  const dispatch = useAppDispatch()
  const dungeon = useDungeon()
  const isGuestCollab = useIsGuestCollab()

  const options: SampleRouteOption[] = useMemo(
    () =>
      sampleRoutes[dungeon.key].map(({ route, affix, difficulty }) => ({
        content: (
          <div className="flex flex-col gap-0.5">
            <div>{route.name}</div>
            <div className="flex gap-1">
              <SampleRouteChip>{difficulty}</SampleRouteChip>
              {affix && <SampleRouteChip>{affix}</SampleRouteChip>}
            </div>
          </div>
        ),
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
      buttonText="Sample routes"
      MainButtonIcon={MagnifyingGlassIcon}
      disabled={isGuestCollab}
    />
  )
}
