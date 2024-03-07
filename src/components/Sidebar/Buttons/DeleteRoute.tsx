import { Button } from '../../Common/Button.tsx'
import { useAppDispatch } from '../../../store/hooks.ts'
import { deleteRoute } from '../../../store/routesReducer.ts'
import { TrashIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'

export function DeleteRoute() {
  const dispatch = useAppDispatch()

  return (
    <>
      <Button
        data-tooltip-id="delete-route-tooltip"
        short
        className="flex-1"
        onClick={() => dispatch(deleteRoute())}
      >
        <TrashIcon width={24} height={24} />
      </Button>
      <TooltipStyled id="delete-route-tooltip" place="bottom-start">
        Delete route
      </TooltipStyled>
    </>
  )
}
