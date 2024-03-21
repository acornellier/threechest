import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Button } from '../../Common/Button.tsx'
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline'
import { setName } from '../../../store/routes/routesReducer.ts'

import { useActualRoute } from '../../../store/routes/routeHooks.ts'
import { useAppDispatch } from '../../../store/storeUtil.ts'
import { dropdownWidth } from '../../Header/Header.tsx'
import { useIsGuestCollab } from '../../../store/collab/collabReducer.ts'

interface Props {
  isRenaming: boolean
  setRenaming: Dispatch<SetStateAction<boolean>>
  hidden?: boolean
}

export function RenameRoute({ isRenaming, setRenaming, hidden }: Props) {
  const route = useActualRoute()
  const dispatch = useAppDispatch()
  const isGuestCollab = useIsGuestCollab()

  const [input, setInput] = useState(route.name)

  const open = useCallback(() => {
    setInput(route.name)
    setRenaming(true)
  }, [route.name, setRenaming])

  const close = useCallback(() => {
    dispatch(setName(input))
    setRenaming(false)
  }, [dispatch, input, setRenaming])

  if (isGuestCollab) return null

  return (
    <>
      {isRenaming && (
        <input
          className="fancy w-full rounded-md"
          style={{ width: dropdownWidth }}
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
        short
        style={{ paddingLeft: 12, paddingRight: 12 }}
        className={`${hidden ? '[&]:hidden' : ''}`}
        tooltipId="rename-route-tooltip"
        tooltip="Rename route"
      />
    </>
  )
}
