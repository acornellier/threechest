import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useRootSelector } from '../../store/hooks.ts'
import { endCollab, joinCollab, startCollab } from '../../store/reducers/collabReducer.ts'
import { useCallback, useEffect } from 'react'
import { Cog8ToothIcon, ShareIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { generateSlug } from 'random-word-slugs'
import { Panel } from '../Common/Panel.tsx'

export function CollabPanel() {
  const dispatch = useAppDispatch()
  const { active, room } = useRootSelector((state) => state.collab)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const collabRoom = urlParams.get('collab')
    if (collabRoom) {
      dispatch(joinCollab(collabRoom))
      dispatch(addToast({ message: 'Collab joined!' }))
    }
  }, [dispatch])

  const shareUrl = useCallback(async (room: string) => {
    const url = window.location.origin + `?collab=${room}`
    window.history.replaceState({}, '', url)
    await navigator.clipboard.writeText(url)
  }, [])

  const onClick = useCallback(async () => {
    if (active) {
      dispatch(endCollab())
      window.history.replaceState({}, '', window.location.origin)
      dispatch(addToast({ message: 'Collab ended.', type: 'info' }))
    } else {
      const room = generateSlug()
      dispatch(startCollab(room))
      await shareUrl(room)
      dispatch(addToast({ message: 'Collab started! URL copied to clipboard.' }))
    }
  }, [dispatch, active, shareUrl])

  const onShare = useCallback(async () => {
    await shareUrl(room)
    dispatch(addToast({ message: 'Collab URL copied to clipboard.' }))
  }, [dispatch, room, shareUrl])

  return (
    <Panel noRightBorder>
      <div className="flex gap-1">
        <Button
          color={active ? 'green' : 'red'}
          Icon={UserGroupIcon}
          outline={!active}
          short
          onClick={onClick}
          className="w-full"
        >
          {!active ? 'Start Collab' : 'Collab active'}
        </Button>
        <Button outline short Icon={Cog8ToothIcon} />
      </div>
      {active && (
        <div className="flex gap-1">
          <Button Icon={ShareIcon} short outline onClick={onShare} className="w-full">
            Share room
          </Button>
        </div>
      )}
    </Panel>
  )
}
