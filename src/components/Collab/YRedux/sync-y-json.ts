import { useEffect } from 'react'
import { Store } from 'redux'
import * as Y from 'yjs'
import { cachedSubscribe } from './redux-subscriber.ts'
import { isEmpty, patchYJson } from '../YJson'
import { JsonTemplateArray, JsonTemplateContainer, JsonTemplateObject } from '../Json'
import { Action } from '@reduxjs/toolkit'
import { useAppStore } from '../../../store/hooks.ts'
import { AppStore, RootState } from '../../../store/store.ts'

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

  // console.debug('syncLocalIntoRemote Syncing')
  patchYJson(yJson, localData)
}

function syncRemoteIntoLocal<T extends JsonTemplateContainer>(
  store: Store,
  setData: (data: T) => Action,
  yJson: Y.Map<T> | Y.Array<T>,
): void {
  if (isEmpty(yJson)) {
    console.debug(
      "syncRemoteIntoLocal Not syncing: Remote data is empty. The YDoc hasn't loaded yet, and syncing would overwrite remote data.",
    )
    return
  }

  const remoteData = yJson.toJSON() as T
  // console.debug('syncRemoteIntoLocal Syncing')
  store.dispatch(setData(remoteData))
}

export function SyncYJson<T extends JsonTemplateObject>(props: {
  yJson: Y.Map<T>
  setData: (data: T) => Action
  selectData: (state: RootState) => T | undefined
}): null
export function SyncYJson<T extends JsonTemplateArray>(props: {
  yJson: Y.Array<T>
  setData: (data: T) => Action
  selectData: (state: RootState) => T | undefined
}): null
export function SyncYJson<T extends JsonTemplateContainer>({
  yJson,
  setData,
  selectData,
}: {
  yJson: Y.Map<T> | Y.Array<T>
  setData: (data: T) => Action
  selectData: (state: RootState) => T | undefined
}): null {
  const store = useAppStore()

  // On mount sync remote into local
  useEffect(() => {
    syncRemoteIntoLocal(store, setData, yJson)
  }, [store, setData, yJson])

  // Subscribe to local changes
  useEffect(() => {
    const unsubscribe = cachedSubscribe(store, selectData, () => {
      syncLocalIntoRemote(store, selectData, yJson)
    })

    return () => unsubscribe()
  }, [store, selectData, setData, yJson])

  // Subscribe to remote changes
  useEffect(() => {
    const observer = (_events: any, transaction: Y.Transaction): void => {
      if (transaction.local) return
      syncRemoteIntoLocal(store, setData, yJson)
    }

    yJson.observeDeep(observer)

    return () => {
      yJson.unobserveDeep(observer)
    }
  }, [store, setData, yJson])

  return null
}
