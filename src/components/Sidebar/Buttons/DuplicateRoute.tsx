import { Button } from '../../Common/Button.tsx'
import { useAppDispatch } from '../../../store/hooks.ts'
import { duplicateRoute } from '../../../store/routesReducer.ts'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'

export function DuplicateRoute() {
  const dispatch = useAppDispatch()

  return (
    <>
      <Button
        data-tooltip-id="duplicate-route-tooltip"
        short
        className="flex-1"
        onClick={() => dispatch(duplicateRoute())}
      >
        <DocumentDuplicateIcon width={24} height={24} />
      </Button>
      <TooltipStyled id="duplicate-route-tooltip" place="bottom-start">
        Duplicate route
      </TooltipStyled>
    </>
  )
}
