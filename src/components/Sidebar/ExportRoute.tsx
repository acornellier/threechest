import { routeToMdtRoute } from '../../code/mdtUtil.ts'
import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useRoute } from '../../store/hooks.ts'
import { clearRoute } from '../../store/reducer.ts'
import { useToasts } from '../Toast/useToasts.ts'

const exportUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/exportRoute'
    : '/api/importRoute'

export function ExportRoute() {
  const dispatch = useAppDispatch()
  const route = useRoute()

  const { addToast } = useToasts()

  const handleClick = () => {
    fetch(exportUrl, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mdtRoute: routeToMdtRoute(route) }),
    })
      .then((res) => res.json())
      .then((str) => {
        addToast('MDT copied to clipboard!')
        return navigator.clipboard.writeText(str)
      })
  }

  return (
    <div className="p-2 bg-gray-900 border-2 border-gray-700 rounded-md flex gap-2 justify-center">
      <Button onClick={handleClick}>Export MDT string</Button>
      <Button onClick={() => dispatch(clearRoute())}>Clear</Button>
    </div>
  )
}
