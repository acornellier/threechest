import { getTextColor } from '../../util/colors.ts'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { useAwarenessStates, useCollabSelector } from '../../store/collab/collabReducer.ts'
import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { Button } from '../Common/Button.tsx'

export function CollabRoomDetails() {
  const room = useCollabSelector((state) => state.room)
  const awarenessStates = useAwarenessStates()
  const [showClients, setShowClients] = useState(false)
  const local = awarenessStates.find(({ isCurrentClient }) => isCurrentClient)
  const isHost = local?.clientType === 'host'

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs -mt-1">Room: {room}</div>
      <div className="flex flex-wrap justify-between gap-2 text-xs">
        {local && (
          <div
            className="flex items-center rounded-sm px-1"
            data-tooltip-id="collab-self-name-tooltip"
            style={{
              backgroundColor: local.color ?? 'none',
              color: local.color ? getTextColor(local.color) : 'inherit',
            }}
          >
            You: {local.name ?? 'No name'} <b className="ml-1">{local.clientType}</b>
          </div>
        )}
        {awarenessStates.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              tiny
              twoDimensional
              outline
              Icon={ChevronDownIcon}
              iconSize={14}
              className="cursor-default whitespace-nowrap"
              data-tooltip-id="collab-guests-tooltip"
              onClick={() => setShowClients((v) => !v)}
            >
              Clients: {awarenessStates.length}
            </Button>
          </div>
        )}
      </div>
      <TooltipStyled id="collab-self-name-tooltip" place="bottom">
        {isHost ? (
          <>
            <p>You are the host of this collab room.</p>
            <p>Only you can change the dungeon or route.</p>
            <p>
              If you are unhappy with the changes your guests have made, you can restore your route
              from a backup using the Restore button.
            </p>
            <p>If you leave, the person who joined the earliest will be promoted to host.</p>
          </>
        ) : (
          <>
            <p>You are a guest in this collab room.</p>
            <p>
              You cannot change the dungeon or route, but you are free to make any other changes.
            </p>
            <p>
              By default, the current route is not saved to your local machine, unless you have
              already saved the route in the past. You can save it with the button at the top right
              of your screen. Leaving the collab will also save the route locally.
            </p>
          </>
        )}
      </TooltipStyled>
      {showClients && (
        <TooltipStyled id="collab-guests-tooltip" padding={4} isOpen>
          <div className="flex flex-col gap-1">
            {awarenessStates.map((awareness) => (
              <div key={awareness.clientId} className="flex items-center gap-1">
                <div
                  className="rounded-sm px-1 flex-1"
                  style={{
                    backgroundColor: awareness.color ?? 'none',
                    color: awareness.color ? getTextColor(awareness.color) : 'inherit',
                  }}
                >
                  {awareness.name}
                  {awareness.clientType === 'host' && ' - host'}
                </div>
                {false && isHost && awareness.clientType === 'guest' && (
                  <Button tiny outline twoDimensional>
                    Promote
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TooltipStyled>
      )}
    </div>
  )
}
