import { routeToMdtRoute } from '../../code/mdtUtil.ts'
import { Button } from '../Common/Button.tsx'
import { useRoute } from '../../store/hooks.ts'
import { useToasts } from '../Toast/useToasts.ts'

const exportUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/exportRoute'
    : '/api/importRoute'

export function ExportRoute() {
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
    <Button short className="flex-1" onClick={handleClick}>
      Export MDT
    </Button>
  )
}
