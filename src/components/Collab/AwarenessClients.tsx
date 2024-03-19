import { useAwarenessStates } from '../../store/hooks.ts'
import { getTextColor } from '../../util/colors.ts'
import { TooltipStyled } from '../Common/TooltipStyled.tsx'

export function AwarenessClients() {
  const awarenessStates = useAwarenessStates()

  const host = awarenessStates.find(({ clientType }) => clientType === 'host')
  const guests = awarenessStates.filter(({ clientType }) => clientType !== 'host')

  return (
    <div>
      <div className="flex justify-between whitespace-nowrap text-xs">
        <div
          className="rounded-sm px-1"
          style={{
            backgroundColor: host?.color ?? 'none',
            color: host?.color ? getTextColor(host.color) : 'inherit',
          }}
        >
          Host:{' '}
          {!host ? (
            'None'
          ) : host.isCurrentClient ? (
            <>
              <b>You</b>
              <span> ({host.name})</span>
            </>
          ) : (
            host.name
          )}
        </div>
        {guests.length > 0 && (
          <>
            <div className="cursor-default" data-tooltip-id="collab-guests-tooltip">
              Guests: {guests.length}
            </div>
            <TooltipStyled id="collab-guests-tooltip" padding={4}>
              <div className="flex flex-col gap-1">
                {guests.map((awareness) => (
                  <div
                    key={awareness.clientId}
                    className="rounded-sm px-1"
                    style={{
                      backgroundColor: awareness.color ?? 'none',
                      color: awareness.color ? getTextColor(awareness.color) : 'inherit',
                    }}
                  >
                    {awareness.name}
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
