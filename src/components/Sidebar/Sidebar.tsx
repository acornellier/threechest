import { RouteName } from './RouteName.tsx'
import { ImportRoute } from './ImportRoute.tsx'
import { ExportRoute } from './ExportRoute.tsx'
import { Pulls } from './Pulls.tsx'

const margin = 48

export function Sidebar() {
  return (
    <div
      className="fixed right-0 z-20 flex flex-col gap-3 w-[276px]"
      style={{
        margin: `${margin}px 0`,
        maxHeight: 'calc(100% - 2*48px)',
      }}
    >
      <RouteName />
      <ImportRoute />
      <ExportRoute />
      <Pulls />
    </div>
  )
}
