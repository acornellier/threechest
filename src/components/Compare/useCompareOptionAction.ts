import { useMemo } from 'react'
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import type { DropdownOption, DropdownOptionAction } from '../Common/Dropdown.tsx'
import { useAppDispatch } from '../../store/storeUtil.ts'
import {
  exitCompare,
  previewCompareRouteAsync,
  setCompareRouteAsync,
} from '../../store/reducers/compareReducer.ts'
import type { Route } from '../../util/types.ts'

interface Options<T extends DropdownOption> {
  tooltipId: string
  routeUid: string
  compareRouteUid: string | undefined
  /** Only for options carrying a full route. Others are loaded from storage by id. */
  getRoute?: (option: T) => Route
}

export function useCompareOptionAction<T extends DropdownOption>({
  tooltipId,
  routeUid,
  compareRouteUid,
  getRoute,
}: Options<T>): DropdownOptionAction<T> {
  const dispatch = useAppDispatch()

  return useMemo(
    () => ({
      Icon: ArrowsRightLeftIcon,
      tooltip: 'Compare with this route',
      tooltipId,
      isActive: (option: T) => option.id === compareRouteUid,
      disabled: (option: T) => option.id === routeUid,
      onClick: (option: T) => {
        if (option.id === compareRouteUid) {
          dispatch(exitCompare())
        } else {
          dispatch(setCompareRouteAsync({ routeId: option.id, route: getRoute?.(option) }))
        }
      },
      onHover: (option: T | null) => {
        dispatch(
          previewCompareRouteAsync(
            option ? { routeId: option.id, route: getRoute?.(option) } : null,
          ),
        )
      },
    }),
    [compareRouteUid, dispatch, getRoute, routeUid, tooltipId],
  )
}
