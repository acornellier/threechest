import { Button } from './Common/Button.tsx'
import { useAppDispatch, useRootSelector } from '../store/hooks.ts'
import { ErrorInfo } from 'react'
import { deleteRoute, newRoute } from '../store/routesReducer.ts'
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface Props {
  errors: Array<{ error: Error; info: ErrorInfo }>
}

export function ErrorPage({ errors }: Props) {
  const rootState = useRootSelector((state) => state)
  const route = rootState?.routes?.present?.route
  const dispatch = useAppDispatch()

  const reloadPage = () => {
    window.location.reload()
  }

  const createEmptyRoute = () => {
    dispatch(newRoute(route?.dungeonKey ?? 'eb'))
    window.location.reload()
  }

  const deleteRouteClick = () => {
    dispatch(deleteRoute())
    window.location.reload()
  }

  const copyErrors = async () => {
    let text = ''

    for (const { error, info } of errors) {
      text += `${error.stack}\n${info.componentStack}`
    }

    text += `\n\nStore:\n${JSON.stringify(rootState)}\n\n`

    await navigator.clipboard.writeText(text)
  }

  return (
    <div className="w-screen h-screen flex justify-center">
      <div className="flex flex-col justify-center items-center gap-8 w-[700px]">
        <div className="text-5xl text-center">Whoops! Something broke.</div>
        <div className="flex flex-col gap-2 text-xl">
          <p>Sorry, there was an error loading the page.</p>
          <p>
            There could be something wrong with the currently loaded route.
            <br />
            Try reloading the page, creating a new empty route, or permanently deleting the current
            route.
          </p>
          <p>If that doesn&apos;t work, you may have to purge your local site data completely.</p>
          <p>Otherwise, please contact me on Discord with the error details.</p>
          <p>Current route name: {route?.name ?? 'Unknown'}</p>
          <p>Current route dungeon key: {route?.dungeonKey ?? 'Unknown'}</p>
          {process.env.NODE_ENV === 'development' && errors[0] && (
            <p>
              {errors[0].error.name}: {errors[0].error.message}
              {errors[0].info.componentStack}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-center gap-4">
            <Button style={{ fontSize: 16 }} onClick={reloadPage}>
              <ArrowPathIcon width={18} height={18} className="mr-1" />
              Reload page
            </Button>
            <Button style={{ fontSize: 16 }} onClick={createEmptyRoute}>
              <PlusCircleIcon width={18} height={18} className="mr-1" />
              Create empty route
            </Button>
            <Button style={{ fontSize: 16 }} onClick={deleteRouteClick}>
              <TrashIcon width={18} height={18} className="mr-1" />
              Delete route
            </Button>
          </div>
          <div className="flex flex-row justify-center gap-4">
            <Button outline style={{ fontSize: 16 }} onClick={copyErrors}>
              <ClipboardIcon width={18} height={18} className="mr-1" />
              Copy error details
            </Button>
            <a href="https://discord.gg/9eSAAnuKTv" target="_blank" rel="noreferrer">
              <Button outline style={{ fontSize: 16 }}>
                <ArrowTopRightOnSquareIcon width={18} height={18} className="mr-1" />
                Open Discord
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
