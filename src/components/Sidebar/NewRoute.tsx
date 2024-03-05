import { Button } from '../Common/Button.tsx'
import { useAppDispatch } from '../../store/hooks.ts'
import { newRoute } from '../../store/routesReducer.ts'
import { PlusCircleIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'

export function NewRoute() {
  const dispatch = useAppDispatch()

  return (
    <>
      <Button
        data-tooltip-id="new-route-tooltip"
        short
        className="flex-1"
        onClick={() => dispatch(newRoute())}
      >
        <PlusCircleIcon width={24} height={24} />
      </Button>
      <TooltipStyled id="new-route-tooltip" place="bottom-start">
        New empty route
      </TooltipStyled>
    </>
  )
}
