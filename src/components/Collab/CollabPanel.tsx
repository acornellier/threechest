import { Button } from '../Common/Button.tsx'
import { joinCollab, useCollabSelector } from '../../store/collab/collabReducer.ts'
import { useCallback, useEffect, useState } from 'react'
import { ArrowUturnLeftIcon, Cog8ToothIcon, PlayIcon, ShareIcon } from '@heroicons/react/24/outline'
import { addToast } from '../../store/reducers/toastReducer.ts'
import { Panel } from '../Common/Panel.tsx'
import { CollabRoomDetails } from './CollabRoomDetails.tsx'
import { CollabSettings } from './CollabSettings.tsx'
import { CollabButton } from './CollabButton.tsx'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { RestoreBackup } from './RestoreBackup.tsx'
import { selectIsLive, setMapMode } from '../../store/reducers/mapReducer.ts'
import { StopIcon } from '@heroicons/react/24/solid'

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
  const collabActive = useCollabSelector((state) => state.active)
  const isLive = useRootSelector(selectIsLive)
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
    <Panel noRightBorder className={`${collapsed && !collabActive ? 'hidden' : ''}`}>
      {!isLive && (
        <div className="flex gap-1">
          <CollabButton active={collabActive} shareUrl={shareUrl} />
          {!collabActive && room && (
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
      )}
      {!collabActive && (
        <Button
          Icon={isLive ? StopIcon : PlayIcon}
          outline
          short
          onClick={() => dispatch(setMapMode(isLive ? 'editing' : 'live'))}
          tooltipId="start-live-route-button"
          tooltip="Use this during your run to navigate through your pulls one by one and get detailed information on each one. Any changes made while Live is active will be discarded."
        >
          {isLive ? 'End live route' : '(NEW) Start live route'}
        </Button>
      )}
      {collabActive && (
        <>
          <div className="flex gap-1">
            <Button Icon={ShareIcon} short outline onClick={onShare} className="w-full">
              Share room
            </Button>
            <RestoreBackup />
          </div>
          <CollabRoomDetails />
        </>
      )}
      {collabSettingsOpen && <CollabSettings onClose={() => setCollabSettingsOpen(false)} />}
    </Panel>
  )
}
