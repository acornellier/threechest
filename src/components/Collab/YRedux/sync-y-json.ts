import { useEffect, useState } from 'react'
import { Store } from 'redux'
import * as Y from 'yjs'
import { cachedSubscribe } from './redux-subscriber.ts'
import { isEmpty, patchYJson } from '../YJson'
import { JsonTemplateContainer } from '../Json'
import { Action } from '@reduxjs/toolkit'
import { AppStore, RootState } from '../../../store/store.ts'
import { useAppStore, useRootSelector } from '../../../store/storeUtil.ts'
import { selectLocalAwarenessIsHost } from '../../../store/collab/collabReducer.ts'

function syncLocalIntoRemote<T extends JsonTemplateContainer>(
  store: AppStore,
  selectData: (state: RootState) => T | undefined,
  yJson: Y.Map<T> | Y.Array<T>,
): void {
  const localData = selectData(store.getState() as RootState)

  if (localData === undefined) {
    console.debug('syncLocalIntoRemote Not syncing: Local data is undefined')
    return
  }

  // console.debug('syncLocalIntoRemote Syncing', localData)
  patchYJson(yJson, localData)
}

function syncRemoteIntoLocal<T extends JsonTemplateContainer>(
  store: Store,
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
  store.dispatch(setData(remoteData))
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
  const store = useAppStore()
  const [remoteDataReceived, setRemoteDataReceived] = useState(false)
  const isHost = useRootSelector(selectLocalAwarenessIsHost)
  const canPublishToRemote = remoteDataReceived || isHost
  const [, setFailCounter] = useState(0) // TODO: remove debug

  // On mount sync remote into local
  useEffect(() => {
    syncRemoteIntoLocal(store, setData, yJson, setRemoteDataReceived)
  }, [store, setData, yJson])

  // Subscribe to local changes
  useEffect(() => {
    const unsubscribe = cachedSubscribe(store, selectData, () => {
      // TODO: remove debug
      if (!canPublishToRemote) {
        setFailCounter((val) => {
          if (val >= 3) {
            console.error("CAN'T PUBLISH - NO REMOTE DATA RECEIVED YET")
          }
          return val + 1
        })
        return
      }
      syncLocalIntoRemote(store, selectData, yJson)
    })

    return () => unsubscribe()
  }, [store, selectData, setData, yJson, canPublishToRemote])

  // Subscribe to remote changes
  useEffect(() => {
    const observer = (_events: any, transaction: Y.Transaction): void => {
      if (transaction.local) return
      syncRemoteIntoLocal(store, setData, yJson, setRemoteDataReceived)
    }

    yJson.observeDeep(observer)

    return () => {
      yJson.unobserveDeep(observer)
    }
  }, [store, setData, yJson])

  return null
}
