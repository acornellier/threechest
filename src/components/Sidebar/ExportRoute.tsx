import { routeToMdtRoute } from '../../code/mdtUtil.ts'
import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useRoute } from '../../store/hooks.ts'
import { clearRoute } from '../../store/reducer.ts'
import { useToasts } from '../Toast/useToasts.ts'
import { Panel } from '../Common/Panel.tsx'

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
        addToast('MDT string copied to clipboard!')
        return navigator.clipboard.writeText(str)
      })
  }

  return (
    <Panel>
      <Button onClick={handleClick}>Export MDT string</Button>
      <Button onClick={() => dispatch(clearRoute())}>Clear</Button>
    </Panel>
  )
}
