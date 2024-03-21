import { highContrastColors } from '../../util/colors.ts'
import {
  AwarenessState,
  CollabState,
  getLocalAwareness,
  savedCollabColorKey,
  savedCollabNameKey,
} from './collabReducer.ts'
import { generateSlug } from 'random-word-slugs'

function checkLocalAwareness(state: CollabState, localAwareness: AwarenessState) {
  if (localAwareness.name && localAwareness.clientType && localAwareness.joinTime) return

  const savedName = localStorage.getItem(savedCollabNameKey)
  const savedColor = localStorage.getItem(savedCollabColorKey)

  localAwareness.name ??= savedName || generateSlug(2, { format: 'title' })
  localAwareness.clientType ??= state.startedCollab ? 'host' : 'guest'
  localAwareness.joinTime ??= new Date().getTime()
  localAwareness.color ??= savedColor || null
}

function setAwarenessColor(state: CollabState, localAwareness: AwarenessState) {
  if (!localAwareness.joinTime) {
    console.error('setAwarenessColor should not be called without localAwareness.joinTime')
    return
  }

  // Check for another client with the same as color as me who joined earlier
  const clashingColor =
    state.awarenessStates.length < highContrastColors.length &&
    state.awarenessStates.some(
      (awareness) =>
        !awareness.isCurrentClient &&
        awareness.color === localAwareness.color &&
        (!awareness.joinTime || awareness.joinTime < localAwareness.joinTime!),
    )

  if (localAwareness.color && !clashingColor) return

  const takenColors = state.awarenessStates.map(({ color }) => color)
  const availableColors = highContrastColors.filter((color) => !takenColors.includes(color))
  const colors = availableColors.length ? availableColors : highContrastColors
  localAwareness.color = colors[Math.floor(Math.random() * colors.length)]!
}

export function shouldPromoteToHost(state: CollabState): boolean {
  if (!state.wsConnected) return false

  const localAwareness = getLocalAwareness(state)
  if (!localAwareness?.joinTime) return false

  // Check that at least 1 second has passed since we joined
  if (localAwareness.joinTime && new Date().getTime() - localAwareness.joinTime < 1000) return false

  // Check for any hosts
  if (state.awarenessStates.some(({ clientType }) => clientType === 'host')) return false

  // Check for another client who joined earlier than us
  return !state.awarenessStates.some(
    ({ isCurrentClient, joinTime }) =>
      !isCurrentClient && joinTime && joinTime < localAwareness.joinTime!,
  )
}

function checkForNoHost(state: CollabState, localAwareness: AwarenessState) {
  if (shouldPromoteToHost(state)) localAwareness.clientType = 'host'
}

function checkForMultipleHost(state: CollabState, localAwareness: AwarenessState) {
  if (!localAwareness.joinTime) {
    console.error('setAwarenessColor should not be called without localAwareness.joinTime')
    return
  }

  const hosts = state.awarenessStates.filter(({ clientType }) => clientType === 'host')
  if (hosts.length < 2) return

  // Check for another host who joined later than me
  if (
    state.awarenessStates.some(
      ({ isCurrentClient, joinTime }) =>
        !isCurrentClient && joinTime && joinTime > localAwareness.joinTime!,
    )
  )
    return

  localAwareness.clientType = 'guest'
}

export function postAwarenessUpdateChecks(state: CollabState, localAwareness: AwarenessState) {
  checkLocalAwareness(state, localAwareness)

  if (!state.wsConnected) return
  setAwarenessColor(state, localAwareness)
  checkForNoHost(state, localAwareness)
  checkForMultipleHost(state, localAwareness)
}
