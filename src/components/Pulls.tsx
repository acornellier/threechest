import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Pull } from './Pull.tsx'
import { roundTo } from '../code/stuff.ts'

export function Pulls() {
  const { dungeon, routeDetailed, dispatch } = useRouteContext()

  const percent = (routeDetailed.count / dungeon.mdt.totalCount) * 100

  return (
    <div className="pulls-section">
      <div
        className="total-count"
        style={{
          backgroundColor: percent >= 100 ? 'green' : 'red',
        }}
      >
        {routeDetailed.count}/{dungeon.mdt.totalCount} - {roundTo(percent, 2).toLocaleString()}%
      </div>
      <div className="pulls">
        {routeDetailed.pulls.map((pull, idx) => (
          <Pull key={idx} pullIndex={idx} pull={pull} />
        ))}
      </div>
      <button className="add-pull" onClick={() => dispatch({ type: 'add_pull' })}>
        Add pull
      </button>
    </div>
  )
}
