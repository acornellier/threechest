import { Button } from '../Common/Button.tsx'
import { useAppDispatch } from '../../store/hooks.ts'
import { deleteRoute } from '../../store/routesReducer.ts'
import { ActionCreators } from 'redux-undo'

export function DeleteRoute() {
  const dispatch = useAppDispatch()

  return (
    <Button
      short
      className="flex-1"
      onClick={() => {
        dispatch(deleteRoute())
        dispatch(ActionCreators.clearHistory())
      }}
    >
      Delete
    </Button>
  )
}
