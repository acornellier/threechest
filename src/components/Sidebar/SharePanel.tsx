import { Panel } from '../Common/Panel.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'
import { CollabButton } from './Buttons/CollabButton.tsx'

export function SharePanel() {
  return (
    <Panel noRightBorder>
      <ExportRoute />
      <ShareRoute />
      <CollabButton />
    </Panel>
  )
}
