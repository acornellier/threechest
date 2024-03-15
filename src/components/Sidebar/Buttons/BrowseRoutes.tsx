import { Dropdown, DropdownOption } from '../../Common/Dropdown.tsx'
import { useCallback } from 'react'
import { MdtRoute } from '../../../util/types.ts'
import { sampleRoutes } from '../../../data/sampleRoutes/sampleRoutes.ts'
import { useAppDispatch } from '../../../store/hooks.ts'
import { importRoute, setPreviewRouteAsync } from '../../../store/reducers/importReducer.ts'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SampleRouteOption extends DropdownOption {
  mdtRoute: MdtRoute
}

const options: SampleRouteOption[] = sampleRoutes.map((route) => ({
  label: route.text,
  id: route.uid,
  mdtRoute: route,
}))

export function BrowseRoutes() {
  const dispatch = useAppDispatch()

  const onSelect = useCallback(
    (option: SampleRouteOption) => dispatch(importRoute({ mdtRoute: option.mdtRoute })),
    [dispatch],
  )

  const onHover = useCallback(
    (option: SampleRouteOption | null) => {
      dispatch(
        setPreviewRouteAsync(option ? { routeId: option.id, mdtRoute: option.mdtRoute } : null),
      )
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
