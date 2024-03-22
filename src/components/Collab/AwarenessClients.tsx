import { getTextColor } from '../../util/colors.ts'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'
import { useAwarenessStates } from '../../store/collab/collabReducer.ts'

export function AwarenessClients() {
  const awarenessStates = useAwarenessStates()
  const local = awarenessStates.find(({ isCurrentClient }) => isCurrentClient)

  if (!local) return

  return (
    <div>
      <div className="flex justify-between whitespace-nowrap text-xs">
        <div
          className="rounded-sm px-1"
          data-tooltip-id="collab-self-name-tooltip"
          style={{
            backgroundColor: local?.color ?? 'none',
            color: local?.color ? getTextColor(local.color) : 'inherit',
          }}
        >
          You: {local.name ?? 'No name'} - <b>{local.clientType}</b>
        </div>
        {awarenessStates.length > 0 && (
          <>
            <div className="cursor-default" data-tooltip-id="collab-guests-tooltip">
              Clients: {awarenessStates.length}
            </div>
          </>
        )}
      </div>
      <TooltipStyled id="collab-self-name-tooltip" place="bottom">
        {local.clientType === 'host' ? (
          <>
            <p>You are the host of this collab room.</p>
            <p>Only you can change the dungeon or route.</p>
            <p>If you leave, the person who joined the earliest will be promoted to host.</p>
          </>
        ) : (
          <>
            <p>You are a guest in this collab room.</p>
            <p>You cannot change the dungeon or route.</p>
            <p>
              By default, the current route is not saved to your local machine, unless you have
              already saved the route in the past. You can save it with the button at the top right
              of your screen. Leaving the collab will also save the route locally.
            </p>
          </>
        )}
      </TooltipStyled>
      <TooltipStyled id="collab-guests-tooltip" padding={4}>
        <div className="flex flex-col gap-1">
          {awarenessStates.map((awareness) => (
            <div
              key={awareness.clientId}
              className="rounded-sm px-1"
              style={{
                backgroundColor: awareness.color ?? 'none',
                color: awareness.color ? getTextColor(awareness.color) : 'inherit',
              }}
            >
              {awareness.name}
              {awareness.clientType === 'host' && ' - host'}
            </div>
          ))}
        </div>
      </TooltipStyled>
    </div>
  )
}
