import { useRootSelector } from '../../store/storeUtil.ts'
import { selectIsLive } from '../../store/reducers/mapReducer.ts'
import { LiveController } from './LiveController.tsx'

export function LiveControllerWrapper() {
  const isLive = useRootSelector(selectIsLive)
  if (!isLive) return false

  return <LiveController />
}
