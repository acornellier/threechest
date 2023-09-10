import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Pull } from '../code/types.ts'

export function Pull({ pullIndex, pull }: { pullIndex: number; pull: Pull }) {
  const { route, dispatch } = useRouteContext()

  const string = [
    pullIndex === route.selectedPull ? '> ' : '',
    `${pullIndex + 1}) `,
    `${pull.mobSpawns.length} mobs`,
  ].join('')

  return (
    <div
      className="pull"
      style={{ backgroundColor: pull.color }}
      onClick={() => dispatch({ type: 'select_pull', pullIndex })}
    >
      {string}
    </div>
  )
}
