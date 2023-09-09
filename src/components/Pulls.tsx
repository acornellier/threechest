import { useRouteContext } from './RouteContext/UseRouteContext.ts'

export function Pulls() {
  const { route, dispatch } = useRouteContext()

  return (
    <div className="pulls">
      {route.pulls.map((pull, idx) => (
        <div
          key={idx}
          className="pull"
          style={{ backgroundColor: pull.color }}
          onClick={() => dispatch({ type: 'select_pull', pullIdx: idx })}
        >
          {idx + 1}) {pull.mobSpawns.length} mobs
        </div>
      ))}
      <button onClick={() => dispatch({ type: 'add_pull' })}> ADD PULL </button>
    </div>
  )
}
