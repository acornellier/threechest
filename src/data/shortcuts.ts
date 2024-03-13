import { isMac } from '../util/dev.ts'

export type Shortcut = { key: string; ctrl?: boolean; shift?: boolean; allowShift?: boolean }

const confirm: Shortcut[] = [{ key: 'Enter' }]
const cancel: Shortcut[] = [{ key: 'Escape' }]
const undo: Shortcut[] = [{ key: 'Z', ctrl: true }]
const redo: Shortcut[] = [{ key: 'Z', ctrl: true, shift: true }]
const backspacePull: Shortcut[] = [{ key: 'Backspace' }]
const deletePull: Shortcut[] = [{ key: 'D' }, { key: 'Delete' }]
const appendPull: Shortcut[] = [{ key: 'A', shift: false }]
const addPull: Shortcut[] = [{ key: 'A', shift: true }]
const prependPull: Shortcut[] = [{ key: 'B' }]
const clearPull: Shortcut[] = [{ key: 'C', ctrl: false }]
const pullUp: Shortcut[] = [{ key: 'ArrowUp' }, { key: 'Tab', shift: true }]
const pullDown: Shortcut[] = [{ key: 'ArrowDown' }, { key: 'Tab' }]
const selectPullNumber: Shortcut[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => ({
  key: n.toString(),
}))
const copy: Shortcut[] = [{ key: 'C', ctrl: true }]
const paste: Shortcut[] = [{ key: 'V', ctrl: true }]
const help: Shortcut[] = [{ key: '?', allowShift: true }]

export function keyText({ key, ctrl, shift }: Shortcut) {
  let text = ''

  if (ctrl) text += isMac ? '⌘' : 'Ctrl+'
  if (shift) text += 'Shift+'

  if (key === 'Delete') text += 'Del'
  else if (key === 'Enter') text += '↵'
  else if (key === 'Escape') text += 'Esc'
  else if (key === 'Backspace') text += '⌫'
  else if (key === 'ArrowUp') text += '↑'
  else if (key === 'ArrowDown') text += '↓  '
  else text += key

  return text
}

export const isEventInInput = (event: Event) =>
  event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement

export const shortcuts = {
  confirm,
  cancel,
  undo,
  redo,
  backspacePull,
  deletePull,
  appendPull,
  addPull,
  prependPull,
  clearPull,
  pullUp,
  pullDown,
  selectPullNumber,
  help,
  copy,
  paste,
} as const
