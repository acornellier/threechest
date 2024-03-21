import { Button } from '../../Common/Button.tsx'
import { deleteRoute } from '../../../store/routes/routesReducer.ts'
import { TrashIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'

import { useAppDispatch } from '../../../store/storeUtil.ts'

export function DeleteRoute() {
  const dispatch = useAppDispatch()

  return (
    <>
      <Button
        Icon={TrashIcon}
        data-tooltip-id="delete-route-tooltip"
        short
        className="flex-1"
        onClick={() => dispatch(deleteRoute())}
      />
      <TooltipStyled id="delete-route-tooltip">Delete route</TooltipStyled>
    </>
  )
}
