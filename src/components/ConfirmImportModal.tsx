import { Button } from './Common/Button.tsx'
import { useAppDispatch, useRootSelector } from '../store/hooks.ts'
import { clearImportingRoute } from '../store/importReducer.ts'
import { setRouteFromMdt } from '../store/routesReducer.ts'
import { mdtDungeonIndexToDungeonKey } from '../code/mdtUtil.ts'
import { dungeonsByKey } from '../data/dungeons.ts'

export function ConfirmImportModal() {
  const dispatch = useAppDispatch()

  const importingRoute = useRootSelector((state) => state.import.importingRoute)

  const cancel = () => {
    dispatch(clearImportingRoute())
  }

  const confirm = (copy: boolean) => {
    if (!importingRoute) return
    dispatch(setRouteFromMdt({ mdtRoute: importingRoute, copy }))
    dispatch(clearImportingRoute())
  }

  if (!importingRoute) return null

  const dungeonKey = mdtDungeonIndexToDungeonKey[importingRoute.value.currentDungeonIdx]
  const dungeon = dungeonsByKey[dungeonKey]

  return (
    <div className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full">
      <div className="fixed w-full h-full opacity-80 bg-neutral-800" />
      <div className="relative z-10 w-[400px] flex rounded-lg border-2 border-gray-600 text-white">
        <div className="gritty absolute z-[-10] w-full h-full bg-[#24293f] rounded-lg" />
        <div className="flex flex-col w-full h-full justify-center gap-5 p-5">
          <h3 className="text-xl font-semibold text-center">Route already exists</h3>

          <div className="leading-relaxed">
            <p>Would you like to overwrite it or make a copy?</p>
            <p>Route name: {importingRoute.text}</p>
            <p>Dungeon: {dungeon.name}</p>
          </div>

          <div className="flex justify-center items-center gap-2">
            <Button outline onClick={cancel}>
              Cancel
            </Button>
            <Button onClick={() => confirm(true)}>Make a copy</Button>
            <Button onClick={() => confirm(false)}>Overwrite</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
