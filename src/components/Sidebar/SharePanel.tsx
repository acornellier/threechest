import { Panel } from '../Common/Panel.tsx'
import { ExportRoute } from './Buttons/ExportRoute.tsx'
import { ShareRoute } from './Buttons/ShareRoute.tsx'

interface Props {
  hidden?: boolean
}

export function SharePanel({ hidden }: Props) {
  return (
    <Panel noRightBorder className={`${hidden ? 'hidden' : ''}`}>
      <div className="flex gap-1">
        <ExportRoute />
        <ShareRoute />
      </div>
    </Panel>
  )
}
