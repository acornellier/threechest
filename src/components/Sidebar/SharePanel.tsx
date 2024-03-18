import { Panel } from '../Common/Panel.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'

export function SharePanel() {
  return (
    <Panel noRightBorder>
      <div className="flex gap-1">
        <ExportRoute />
        <ShareRoute />
      </div>
    </Panel>
  )
}
