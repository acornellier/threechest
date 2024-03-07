import { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useAppDispatch, useRoute } from '../../../store/hooks.ts'
import { Button } from '../../Common/Button.tsx'
import { CheckIcon, PencilIcon } from '@heroicons/react/24/outline'
import { TooltipStyled } from '../../Common/TooltipStyled.tsx'
import { setName } from '../../../store/routesReducer.ts'

interface Props {
  isRenaming: boolean
  setRenaming: Dispatch<SetStateAction<boolean>>
}

export function RenameRoute({ isRenaming, setRenaming }: Props) {
  const route = useRoute()
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
          className="p-2 w-full bg-gray-100 rounded-md fancy"
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
        onClick={isRenaming ? close : open}
        twoDimensional
        data-tooltip-id="rename-route-tooltip"
        short
        style={{ paddingLeft: 12, paddingRight: 12 }}
      >
        {isRenaming ? <CheckIcon width={20} height={20} /> : <PencilIcon width={20} height={20} />}
      </Button>
      <TooltipStyled id="rename-route-tooltip" place="bottom-start">
        Rename route
      </TooltipStyled>
    </>
  )
}
