import { useRoute } from '../../store/hooks.ts'
import { Drawing } from './Drawing.tsx'

export function Drawings() {
  const route = useRoute()

  return route.drawings.map((drawing, index) => <Drawing key={index} drawing={drawing} />)
}
