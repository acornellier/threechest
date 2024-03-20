import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useCollabSelector } from '../../store/hooks.ts'
import { joinCollab } from '../../store/reducers/collabReducer.ts'
import { useCallback, useEffect, useState } from 'react'
import { Cog8ToothIcon, ShareIcon } from '@heroicons/react/24/outline'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { Panel } from '../Common/Panel.tsx'
import { AwarenessClients } from './AwarenessClients.tsx'
import { CollabSettings } from './CollabSettings.tsx'
import { CollabButton } from './CollabButton.tsx'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'

interface Props {
  collapsed?: boolean
}

export function CollabPanel({ collapsed }: Props) {
  const dispatch = useAppDispatch()
  const [collabSettingsOpen, setCollabSettingsOpen] = useState(false)
  const active = useCollabSelector((state) => state.active)
  const room = useCollabSelector((state) => state.room)

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

  const onShare = useCallback(async () => {
    await shareUrl(room)
    dispatch(addToast({ message: 'Collab URL copied to clipboard.' }))
  }, [dispatch, room, shareUrl])

  return (
    <Panel noRightBorder className={`${collapsed && !active ? 'hidden' : ''}`}>
      <div className="flex gap-1">
        <CollabButton active={active} shareUrl={shareUrl} />
        <Button
          data-tooltip-id="collab-settings-tooltip"
          outline
          short
          Icon={Cog8ToothIcon}
          onClick={() => setCollabSettingsOpen(true)}
        />
        <TooltipStyled id="collab-settings-tooltip">Collab settings</TooltipStyled>
      </div>
      {active && (
        <div className="flex gap-1">
          <Button Icon={ShareIcon} short outline onClick={onShare} className="w-full">
            Share room
          </Button>
        </div>
      )}
      {active && <AwarenessClients />}
      {collabSettingsOpen && <CollabSettings onClose={() => setCollabSettingsOpen(false)} />}
    </Panel>
  )
}
