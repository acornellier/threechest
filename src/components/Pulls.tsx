import { useRouteContext } from './RouteContext/UseRouteContext.ts'
import { Pull } from './Pull.tsx'
import { roundTo } from '../code/stuff.ts'

export function Pulls() {
  const { dungeon, routeDetailed, dispatch } = useRouteContext()

  const percent = (routeDetailed.count / dungeon.mdt.totalCount) * 100

  return (
    <div className="flex flex-col p-2 gap-2 bg-gray-500 border-2 border-gray-400 rounded-md">
      <div
        className="flex justify-center mx-2"
        style={{
          backgroundColor: percent >= 100 ? 'green' : 'red',
        }}
      >
        {routeDetailed.count}/{dungeon.mdt.totalCount} - {roundTo(percent, 2).toLocaleString()}%
      </div>
      <div className="flex flex-col gap-0.5">
        {routeDetailed.pulls.map((pull, idx) => (
          <Pull key={idx} pullIndex={idx} pull={pull} />
        ))}
      </div>
      <button className="mx-2 bg-gray-200" onClick={() => dispatch({ type: 'add_pull' })}>
        Add pull
      </button>
    </div>
  )
}
