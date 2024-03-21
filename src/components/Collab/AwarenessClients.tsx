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
          style={{
            backgroundColor: local?.color ?? 'none',
            color: local?.color ? getTextColor(local.color) : 'inherit',
          }}
        >
          You: {local.name ?? 'No name'} ({local.clientType})
        </div>
        {awarenessStates.length > 0 && (
          <>
            <div className="cursor-default" data-tooltip-id="collab-guests-tooltip">
              Clients: {awarenessStates.length}
            </div>
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
                    {awareness.clientType === 'host' && ' (Host)'}
                  </div>
                ))}
              </div>
            </TooltipStyled>
          </>
        )}
      </div>
    </div>
  )
}
