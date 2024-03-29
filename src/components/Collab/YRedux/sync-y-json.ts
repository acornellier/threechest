import { useEffect, useRef, useState } from 'react'
import * as Y from 'yjs'
import { isEmpty, patchYJson } from '../YJson'
import { JsonTemplateContainer } from '../Json'
import { Action } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from '../../../store/store.ts'
import { useAppDispatch, useRootSelector } from '../../../store/storeUtil.ts'
import { selectLocalAwarenessIsHost } from '../../../store/collab/collabReducer.ts'

function syncLocalIntoRemote<T extends JsonTemplateContainer>(
  localData: T | undefined,
  yJson: Y.Map<T> | Y.Array<T>,
): void {
  if (localData === undefined) {
    console.debug('syncLocalIntoRemote Not syncing: Local data is undefined')
    return
  }

  // console.debug('syncLocalIntoRemote Syncing', localData)
  patchYJson(yJson, localData)
}

function syncRemoteIntoLocal<T extends JsonTemplateContainer>(
  dispatch: AppDispatch,
  setData: (data: T) => Action,
  yJson: Y.Map<T> | Y.Array<T>,
  setRemoteDataReceived: (val: boolean) => void,
): void {
  if (isEmpty(yJson)) {
    console.debug(
      "syncRemoteIntoLocal Not syncing: Remote data is empty. The YDoc hasn't loaded yet, and syncing would overwrite remote data.",
    )
    return
  }

  const remoteData = yJson.toJSON() as T
  // console.debug('syncRemoteIntoLocal Syncing', remoteData)
  dispatch(setData(remoteData))
  setRemoteDataReceived(true)
}

interface Props<T extends JsonTemplateContainer> {
  yJson: Y.Map<T> | Y.Array<T>
  setData: (data: T) => Action
  selectData: (state: RootState) => T | undefined
}

export function SyncYJson<T extends JsonTemplateContainer>({
  yJson,
  setData,
  selectData,
}: Props<T>): null {
  const dispatch = useAppDispatch()
  const [remoteDataReceived, setRemoteDataReceived] = useState(false)
  const isHost = useRootSelector(selectLocalAwarenessIsHost)
  const canPublishToRemote = remoteDataReceived || isHost

  // On mount sync remote into local
  useEffect(() => {
    syncRemoteIntoLocal(dispatch, setData, yJson, setRemoteDataReceived)
  }, [dispatch, setData, yJson])

  // Subscribe to local changes
  const stateCache = useRef<T | undefined>()
  const newState = useRootSelector(selectData)
  useEffect(() => {
    if (stateCache.current !== newState) {
      if (canPublishToRemote) {
        stateCache.current = newState
        syncLocalIntoRemote(newState, yJson)
      }
    }
  }, [canPublishToRemote, newState, yJson])

  // Subscribe to remote changes
  useEffect(() => {
    const observer = (_events: any, transaction: Y.Transaction): void => {
      if (transaction.local) return
      syncRemoteIntoLocal(dispatch, setData, yJson, setRemoteDataReceived)
    }

    yJson.observeDeep(observer)

    return () => {
      yJson.unobserveDeep(observer)
    }
  }, [dispatch, setData, yJson])

  return null
}
