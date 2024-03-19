import { Button } from '../../Common/Button.tsx'
import { useAppDispatch, useIsGuestCollab } from '../../../store/hooks.ts'
import { duplicateRoute } from '../../../store/routes/routesReducer.ts'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'

export function DuplicateRoute() {
  const dispatch = useAppDispatch()
  const isGuestCollab = useIsGuestCollab()

  return (
    <>
      <Button
        Icon={DocumentDuplicateIcon}
        data-tooltip-id="duplicate-route-tooltip"
        short
        className="flex-1"
        onClick={() => dispatch(duplicateRoute())}
        disabled={isGuestCollab}
      />
      <TooltipStyled id="duplicate-route-tooltip">Duplicate route</TooltipStyled>
    </>
  )
}
