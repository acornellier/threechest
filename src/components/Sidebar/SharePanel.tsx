import { Panel } from '../Common/Panel.tsx'
import { ExportRoute } from './ExportRoute.tsx'
import { ShareRoute } from './ShareRoute.tsx'

export function SharePanel() {
  return (
    <Panel row>
      <ExportRoute />
      <ShareRoute />
    </Panel>
  )
}
