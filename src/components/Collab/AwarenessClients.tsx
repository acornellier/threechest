import { useAwarenessStates } from '../../store/hooks.ts'
import { getTextColor } from '../../util/colors.ts'
import { useState } from 'react'
import { Panel } from '../Common/Panel.tsx'

export function AwarenessClients() {
  const awarenessStates = useAwarenessStates()
  const host = awarenessStates.find(({ clientType }) => clientType === 'host')
  const [showGuests, setShowGuests] = useState(false)

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
          Host: {!host ? 'None' : host.isCurrentClient ? `You (${host.name})` : host.name}
        </div>
        {awarenessStates.length > 1 && (
          <div>
            <div
              className="cursor-default"
              onMouseEnter={() => setShowGuests(true)}
              onMouseLeave={() => setShowGuests(false)}
            >
              Guests: {awarenessStates.length - 1}
            </div>
            {showGuests && (
              <Panel
                className="[&]:absolute right-0 z-20 flex flex-col gap-0.5 bg-black"
                innerClass="[&]:gap-1"
              >
                {awarenessStates
                  .filter(({ clientType }) => clientType !== 'host')
                  .map((awareness) => (
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
              </Panel>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
