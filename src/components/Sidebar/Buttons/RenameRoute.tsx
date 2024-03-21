import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'
import { setName } from '../../../store/routes/routesReducer.ts'

import { useActualRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'

interface Props {
  isRenaming: boolean
  setRenaming: Dispatch<SetStateAction<boolean>>
  hidden?: boolean
}

export function RenameRoute({ isRenaming, setRenaming, hidden }: Props) {
  const route = useActualRoute()
  const dispatch = useAppDispatch()

  const [input, setInput] = useState(route.name)

  const open = useCallback(() => {
    setInput(route.name)
    setRenaming(true)
  }, [route.name, setRenaming])

  const close = useCallback(() => {
    dispatch(setName(input))
    setRenaming(false)
  }, [dispatch, input, setRenaming])

  return (
    <>
      {isRenaming && (
        <input
          className="fancy w-full rounded-md"
          autoFocus
          placeholder="Route name"
          onKeyDown={(e) => {
            if (e.key === 'Enter') close()
          }}
          onChange={(e) => {
            setInput(e.target.value)
          }}
          value={input}
        />
      )}
      <Button
        Icon={isRenaming ? CheckIcon : PencilIcon}
        iconSize={20}
        onClick={isRenaming ? close : open}
        twoDimensional
        data-tooltip-id="rename-route-tooltip"
        short
        style={{ paddingLeft: 12, paddingRight: 12 }}
        className={`${hidden ? '[&]:hidden' : ''}`}
      />
      <TooltipStyled id="rename-route-tooltip">Rename route</TooltipStyled>
    </>
  )
}
