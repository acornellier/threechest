import { Button } from '../Common/Button.tsx'
import { useAppDispatch } from '../../store/hooks.ts'
import { newRoute } from '../../store/reducer.ts'
import { ActionCreators } from 'redux-undo'

export function NewRoute() {
  const dispatch = useAppDispatch()

  return (
    <Button
      short
      className="flex-1"
      onClick={() => {
        dispatch(newRoute())
        dispatch(ActionCreators.clearHistory())
      }}
    >
      New
    </Button>
  )
}
