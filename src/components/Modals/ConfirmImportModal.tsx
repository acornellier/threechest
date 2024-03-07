import { Button } from '../Common/Button.tsx'
import { useAppDispatch, useRootSelector } from '../../store/hooks.ts'
import { clearImportingRoute } from '../../store/importReducer.ts'
import { setRouteFromMdt } from '../../store/routesReducer.ts'
import { dungeonsByMdtIdx } from '../../data/dungeons.ts'
import { Modal } from '../Common/Modal.tsx'
import { useCallback } from 'react'

export function ConfirmImportModal() {
  const dispatch = useAppDispatch()

  const importingRoute = useRootSelector((state) => state.import.importingRoute)

  const cancel = useCallback(() => {
    dispatch(clearImportingRoute())
  }, [dispatch])

  const confirm = (copy: boolean) => {
    if (!importingRoute) return
    dispatch(setRouteFromMdt({ mdtRoute: importingRoute, copy }))
    dispatch(clearImportingRoute())
  }

  if (!importingRoute) return null

  const dungeon = dungeonsByMdtIdx[importingRoute.value.currentDungeonIdx]

  return (
    <Modal
      title="Route already exists"
      onClose={cancel}
      contents={
        <>
          <p>Would you like to overwrite it or make a copy?</p>
          <p>Route name: {importingRoute.text}</p>
          <p>Dungeon: {dungeon?.name}</p>
        </>
      }
      buttons={
        <>
          <Button outline onClick={cancel}>
            Cancel
          </Button>
          <Button onClick={() => confirm(true)}>Make a copy</Button>
          <Button onClick={() => confirm(false)}>Overwrite</Button>
        </>
      }
    />
  )
}
