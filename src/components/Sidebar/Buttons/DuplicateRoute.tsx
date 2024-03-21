import { Button } from '../../Common/Button.tsx'
import { duplicateRoute } from '../../../store/routes/routesReducer.ts'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'

import { useAppDispatch } from '../../../store/storeUtil.ts'

export function DuplicateRoute() {
  const dispatch = useAppDispatch()

  return (
    <>
      <Button
        Icon={DocumentDuplicateIcon}
        data-tooltip-id="duplicate-route-tooltip"
        short
        className="flex-1"
        onClick={() => dispatch(duplicateRoute())}
      />
      <TooltipStyled id="duplicate-route-tooltip">Duplicate route</TooltipStyled>
    </>
  )
}
