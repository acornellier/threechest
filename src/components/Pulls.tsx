import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Pull } from './Pull.tsx'

export function Pulls() {
  const { route, dispatch } = useRouteContext()

  return (
    <div className="pulls">
      {route.pulls.map((pull, idx) => (
        <Pull key={idx} pullIndex={idx} pull={pull} />
      ))}
      <button onClick={() => dispatch({ type: 'add_pull' })}> ADD PULL </button>
    </div>
  )
}
