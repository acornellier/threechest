import { Button } from '../../Common/Button.tsx'
import { useAppDispatch, useIsGuestCollab } from '../../../store/hooks.ts'
import { deleteRoute } from '../../../store/routes/routesReducer.ts'
import { TrashIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'

export function DeleteRoute() {
  const dispatch = useAppDispatch()
  const isGuestCollab = useIsGuestCollab()

  return (
    <>
      <Button
        Icon={TrashIcon}
        data-tooltip-id="delete-route-tooltip"
        short
        className="flex-1"
        onClick={() => dispatch(deleteRoute())}
        disabled={isGuestCollab}
      />
      <TooltipStyled id="delete-route-tooltip">Delete route</TooltipStyled>
    </>
  )
}
