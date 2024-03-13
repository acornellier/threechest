export type Shortcut = { key: string; ctrl?: boolean; shift?: boolean; allowShift?: boolean }

const undo: Shortcut[] = [{ key: 'Z', ctrl: true }]
const redo: Shortcut[] = [{ key: 'Z', ctrl: true, shift: true }]
const backspacePull: Shortcut[] = [{ key: 'Backspace' }]
const deletePull: Shortcut[] = [{ key: 'D' }, { key: 'Delete' }]
const appendPull: Shortcut[] = [{ key: 'a', shift: false }]
const addPull: Shortcut[] = [{ key: 'A', shift: true }]
const prependPull: Shortcut[] = [{ key: 'B' }]
const clearPull: Shortcut[] = [{ key: 'C' }]
const pullUp: Shortcut[] = [{ key: 'ArrowUp' }, { key: 'Tab', shift: true }]
const pullDown: Shortcut[] = [{ key: 'ArrowDown' }, { key: 'Tab' }]
const selectPullNumber: Shortcut[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => ({
  key: n.toString(),
}))
const help: Shortcut[] = [{ key: '?', allowShift: true }]

const isMac = navigator.platform.includes('Mac')

export function keyText({ key, ctrl, shift }: Shortcut) {
  let text = ''

  if (ctrl) text += isMac ? '⌘' : 'Ctrl+'
  if (shift) text += '⇧'

  if (key === 'Delete') text += 'Del'
  else if (key === 'ArrowUp') text += '↑'
  else if (key === 'ArrowDown') text += '↓  '
  else text += key

  return text
}

export const shortcuts = {
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
} as const
