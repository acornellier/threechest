import { Button } from '../../Common/Button.tsx'
import { deleteRoute } from '../../../store/routes/routesReducer.ts'
import { TrashIcon } from '@heroicons/react/24/outline'

import { useAppDispatch } from '../../../store/storeUtil.ts'

export function DeleteRoute() {
  const dispatch = useAppDispatch()

  return (
    <Button
      Icon={TrashIcon}
      short
      className="flex-1"
      onClick={() => dispatch(deleteRoute())}
      tooltip="Delete route"
      tooltipId="delete-route-tooltip"
    />
  )
}
