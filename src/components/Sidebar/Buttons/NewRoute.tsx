import { Button } from '../../Common/Button.tsx'
import { newRoute } from '../../../store/routes/routesReducer.ts'
import { PlusCircleIcon } from '@heroicons/react/24/outline'

import { useAppDispatch } from '../../../store/storeUtil.ts'

export function NewRoute() {
  const dispatch = useAppDispatch()

  return (
    <Button
      Icon={PlusCircleIcon}
      short
      className="flex-1"
      onClick={() => dispatch(newRoute())}
      tooltip="New empty route"
      tooltipId="new-route-tooltip"
    />
  )
}
