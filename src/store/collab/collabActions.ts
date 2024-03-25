import { highContrastColors } from '../../util/colors.ts'
import {
  AwarenessState,
  CollabState,
  getLocalAwareness,
  savedCollabColorKey,
  savedCollabNameKey,
} from './collabReducer.ts'
import { generateCollabName } from '../../util/slugs/slugGenerator.ts'

function checkLocalAwareness(state: CollabState, localAwareness: AwarenessState) {
  localAwareness.name ??= localStorage.getItem(savedCollabNameKey) || generateCollabName()
  localAwareness.clientType ??= state.startedCollab ? 'host' : 'guest'
  localAwareness.joinTime ??= new Date().getTime()
  localAwareness.color ??= localStorage.getItem(savedCollabColorKey) || null
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
  if (!localAwareness) return false

  // Check for someone promoting us to host
  if (
    state.awarenessStates.some(
      ({ promotingClientId }) => promotingClientId === localAwareness.clientId,
    )
  )
    return true

  const localJoinTime = localAwareness.joinTime
  if (!localJoinTime) return false

  // Check that at least 1 second has passed since we joined
  if (new Date().getTime() - localJoinTime < 1000) return false

  // If there is already a host, do not promote
  if (state.awarenessStates.some(({ clientType }) => clientType === 'host')) return false

  // Promote if no other client joined earlier than us
  return !state.awarenessStates.some(
    ({ isCurrentClient, joinTime }) => !isCurrentClient && joinTime && joinTime < localJoinTime,
  )
}

function checkForPromotion(state: CollabState, localAwareness: AwarenessState) {
  if (shouldPromoteToHost(state)) {
    localAwareness.clientType = 'host'
  }
}

function shouldDemoteToGuest(state: CollabState, localAwareness: AwarenessState) {
  const localJoinTime = localAwareness.joinTime
  if (!localJoinTime) return false

  const hosts = state.awarenessStates.filter(({ clientType }) => clientType === 'host')
  if (hosts.length < 2) return false

  const otherHosts = hosts.filter(({ isCurrentClient }) => !isCurrentClient)

  // Demote if we've completed promoting someone else
  if (
    localAwareness.promotingClientId &&
    otherHosts.some(({ clientId }) => localAwareness.promotingClientId === clientId)
  )
    return true

  // Demote if there is any other host joined earlier but isn't promoting us
  return otherHosts.some(
    ({ joinTime, promotingClientId }) =>
      joinTime && joinTime < localJoinTime && promotingClientId !== localAwareness.clientId,
  )
}

function checkForDemotion(state: CollabState, localAwareness: AwarenessState) {
  if (shouldDemoteToGuest(state, localAwareness)) {
    localAwareness.clientType = 'guest'
    localAwareness.promotingClientId = null
  }
}

export function postAwarenessUpdateChecks(state: CollabState, localAwareness: AwarenessState) {
  checkLocalAwareness(state, localAwareness)

  if (!state.wsConnected) return
  setAwarenessColor(state, localAwareness)
  checkForPromotion(state, localAwareness)
  checkForDemotion(state, localAwareness)
}
