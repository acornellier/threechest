import { Button } from './Button.tsx'
import type { ErrorInfo} from 'react';
import { useEffect } from 'react'
import { defaultDungeonKey, deleteRoute, newRoute } from '../../store/routes/routesReducer.ts'
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { isDev } from '../../util/dev.ts'
import { useAppDispatch, useRootSelector } from '../../store/storeUtil.ts'
import { endCollab } from '../../store/collab/collabReducer.ts'

interface Props {
  errors: Array<{ error: Error; info: ErrorInfo }>
}

export function ErrorPage({ errors }: Props) {
  const dispatch = useAppDispatch()

  const rootState = useRootSelector((state) => state)
  const route = rootState?.routes?.present?.route
  const collabActive = rootState?.collab?.active

  useEffect(() => {
    if (collabActive) dispatch(endCollab())
  }, [dispatch, collabActive])

  const reloadPage = () => {
    setTimeout(() => window.location.reload(), 500)
  }

  const createEmptyRoute = () => {
    dispatch(newRoute(route?.dungeonKey ?? defaultDungeonKey))
    reloadPage()
  }

  const deleteRouteClick = () => {
    dispatch(deleteRoute())
    reloadPage()
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
          {isDev && errors[0] && (
            <p className="text-sm">
              {errors[0].error.name}: {errors[0].error.message}
              {errors[0].info.componentStack &&
                errors[0].info.componentStack
                  .split('\n')
                  .map((text, idx) => <p key={idx}>{text}</p>)}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-center gap-4">
            <Button Icon={ArrowPathIcon} style={{ fontSize: 16 }} onClick={reloadPage}>
              Reload page
            </Button>
            <Button Icon={PlusCircleIcon} style={{ fontSize: 16 }} onClick={createEmptyRoute}>
              Create empty route
            </Button>
            <Button Icon={TrashIcon} style={{ fontSize: 16 }} onClick={deleteRouteClick}>
              Delete route
            </Button>
          </div>
          <div className="flex flex-row justify-center gap-4">
            <Button Icon={ClipboardIcon} outline style={{ fontSize: 16 }} onClick={copyErrors}>
              Copy error details
            </Button>
            <a href="https://discord.gg/9eSAAnuKTv" target="_blank" rel="noreferrer">
              <Button Icon={ArrowTopRightOnSquareIcon} outline style={{ fontSize: 16 }}>
                Open Discord
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
