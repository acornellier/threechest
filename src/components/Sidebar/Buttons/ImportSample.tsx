import { Dropdown, DropdownOption } from '../../Common/Dropdown.tsx'
import { useCallback } from 'react'
import { MdtRoute } from '../../../util/types.ts'
import { ebSampleRoutes } from '../../../data/sampleRoutes/eb.ts'
import { useAppDispatch } from '../../../store/hooks.ts'
import { importRoute } from '../../../store/importReducer.ts'

interface SampleRouteOption extends DropdownOption {
  route: MdtRoute
}

const options: SampleRouteOption[] = ebSampleRoutes.map((route) => ({
  label: route.text,
  id: route.uid,
  route,
}))

export function ImportSample() {
  const dispatch = useAppDispatch()

  const onSelect = useCallback(
    (option: SampleRouteOption) => dispatch(importRoute({ mdtRoute: option.route })),
    [dispatch],
  )

  return <Dropdown short options={options} onSelect={onSelect} buttonText="Import sample route" />
}
