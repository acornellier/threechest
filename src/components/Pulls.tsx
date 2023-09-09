import { useRouteContext } from './RouteContext/UseRouteContext.ts'

export function Pulls() {
  const { route, addPull } = useRouteContext()

  return (
    <div className="pulls">
      {route.pulls.map((pull, idx) => (
        <div className="pull">
          {idx + 1}) {pull.enemies.length} mobs
        </div>
      ))}
      <button onClick={addPull}> ADD PULL </button>
    </div>
  )
}
