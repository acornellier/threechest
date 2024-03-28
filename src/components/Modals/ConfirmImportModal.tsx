import { Button } from '../Common/Button.tsx'
import { clearImportingRoute } from '../../store/reducers/importReducer.ts'
import { setRouteFromMdt } from '../../store/routes/routesReducer.ts'
import { dungeonsByMdtIdx } from '../../data/dungeons.ts'
import { Modal } from '../Common/Modal.tsx'
import { useCallback } from 'react'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { shortcuts } from '../../data/shortcuts.ts'
import { MdtRoute } from '../../util/types.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'

interface Props {
  importingRoute: MdtRoute
}

export function ConfirmImportModalComponent({ importingRoute }: Props) {
  const dispatch = useAppDispatch()

  const cancel = useCallback(() => {
    dispatch(clearImportingRoute())
  }, [dispatch])

  const confirm = useCallback(
    (copy: boolean) => {
      if (!importingRoute) return
      dispatch(setRouteFromMdt({ mdtRoute: importingRoute, copy: exportRoute }))
      dispatch(clearImportingRoute())
    },
    [dispatch, importingRoute],
  )

  const makeCopy = useCallback(() => confirm(true), [confirm])
  const overwrite = useCallback(() => confirm(false), [confirm])

  useShortcut(shortcuts.confirm, overwrite)

  if (!importingRoute) return null

  const dungeon = dungeonsByMdtIdx[importingRoute.value.currentDungeonIdx]

  return (
    <Modal
      title="Route already exists"
      onClose={cancel}
      closeOnEscape
      contents={
        <div className="leading-loose">
          <p>Would you like to overwrite it or make a copy?</p>
          <p>Route name: {importingRoute.text}</p>
          <p>Dungeon: {dungeon?.name}</p>
        </div>
      }
      buttons={
        <>
          <Button outline onClick={cancel}>
            Cancel
          </Button>
          <Button onClick={makeCopy}>Make a copy</Button>
          <Button justifyStart onClick={overwrite} shortcut={shortcuts.confirm[0]}>
            Overwrite
          </Button>
        </>
      }
    />
  )
}

export function ConfirmImportModal() {
  const importingRoute = useRootSelector((state) => state.import.importingRoute)
  if (!importingRoute) return null
  return <ConfirmImportModalComponent importingRoute={importingRoute} />
}
