import { UserGroupIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common/Button.tsx'
import { useCallback } from 'react'
import { endCollab, startCollab } from '../../store/collab/collabReducer.ts'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { generateCollabRoom } from '../../util/slugs/slugGenerator.ts'

interface Props {
  active: boolean
  shareUrl: (room: string) => Promise<void>
}

export function CollabButton({ active, shareUrl }: Props) {
  const dispatch = useAppDispatch()
  const wsConnected = useRootSelector((state) => state.collab.wsConnected)

  const onClick = useCallback(async () => {
    if (active) {
      dispatch(endCollab())
      dispatch(addToast({ message: 'Collab ended.', type: 'info' }))
    } else {
      const room = generateCollabRoom()
      dispatch(startCollab(room))
      await shareUrl(room)
      dispatch(addToast({ message: 'Collab started! URL copied to clipboard.' }))
    }
  }, [dispatch, active, shareUrl])

  return (
    <Button
      color={!active ? 'red' : !wsConnected ? 'yellow' : 'green'}
      Icon={UserGroupIcon}
      outline={!active}
      short
      twoDimensional={active}
      onClick={onClick}
      className="w-full"
    >
      {!active ? 'Start Collab' : !wsConnected ? 'Connecting...' : 'Leave collab'}
    </Button>
  )
}
