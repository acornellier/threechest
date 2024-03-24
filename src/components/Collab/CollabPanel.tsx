import { Button } from '../Common/Button.tsx'
import { joinCollab, useCollabSelector } from '../../store/collab/collabReducer.ts'
import { useCallback, useEffect, useState } from 'react'
import { ArrowUturnLeftIcon, Cog8ToothIcon, ShareIcon } from '@heroicons/react/24/outline'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { Panel } from '../Common/Panel.tsx'
import { AwarenessClients } from './AwarenessClients.tsx'
import { CollabSettings } from './CollabSettings.tsx'
import { CollabButton } from './CollabButton.tsx'

import { useAppDispatch } from '../../store/storeUtil.ts'
import { RestoreBackup } from './RestoreBackup.tsx'

interface Props {
  collapsed?: boolean
}

function updateCollabUrl(room: string) {
  const url = window.location.origin + `?collab=${room}`
  window.history.replaceState({}, '', url)
  return url
}

export function CollabPanel({ collapsed }: Props) {
  const dispatch = useAppDispatch()
  const [collabSettingsOpen, setCollabSettingsOpen] = useState(false)
  const active = useCollabSelector((state) => state.active)
  const room = useCollabSelector((state) => state.room)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const collabRoom = urlParams.get('collab')
    if (collabRoom && room !== collabRoom) {
      dispatch(joinCollab(collabRoom))
      dispatch(addToast({ message: `Collab joined: ${collabRoom}` }))
    }
  }, [dispatch, room])

  const shareUrl = useCallback(async (room: string) => {
    const url = updateCollabUrl(room)
    await navigator.clipboard.writeText(url)
  }, [])

  const onShare = useCallback(async () => {
    await shareUrl(room)
    dispatch(addToast({ message: 'Collab URL copied to clipboard.' }))
  }, [dispatch, room, shareUrl])

  const onRejoin = useCallback(() => {
    dispatch(joinCollab(room))
    dispatch(addToast({ message: `Collab rejoined: ${room}` }))
    updateCollabUrl(room)
  }, [dispatch, room])

  return (
    <Panel noRightBorder className={`${collapsed && !active ? 'hidden' : ''}`}>
      <div className="flex gap-1">
        <CollabButton active={active} shareUrl={shareUrl} />
        {!active && room && (
          <Button
            Icon={ArrowUturnLeftIcon}
            outline
            short
            onClick={onRejoin}
            tooltip="Rejoin last collab"
            tooltipId="collab-rejoin-tooltip"
          />
        )}
        <Button
          outline
          short
          Icon={Cog8ToothIcon}
          onClick={() => setCollabSettingsOpen(true)}
          tooltipId="collab-settings-tooltip"
          tooltip="Collab settings"
        />
      </div>
      {active && (
        <>
          <div className="flex gap-1">
            <Button Icon={ShareIcon} short outline onClick={onShare} className="w-full">
              Share room
            </Button>
            <RestoreBackup />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-xs -mt-1">Room: {room}</div>
            <AwarenessClients />
          </div>
        </>
      )}
      {collabSettingsOpen && <CollabSettings onClose={() => setCollabSettingsOpen(false)} />}
    </Panel>
  )
}
