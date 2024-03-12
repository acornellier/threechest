export interface Modifiers {
  ctrl?: boolean
  shift?: boolean
}

export type Shortcut = { key: string; mod?: Modifiers }

const undo: Shortcut[] = [{ key: 'z', mod: { ctrl: true } }]
const redo: Shortcut[] = [{ key: 'z', mod: { ctrl: true, shift: true } }]
const backspacePull: Shortcut[] = [{ key: 'Backspace' }]
const deletePull: Shortcut[] = [{ key: 'd' }, { key: 'Delete' }]
const appendPull: Shortcut[] = [{ key: 'a' }]
const prependPull: Shortcut[] = [{ key: 'b' }]
const clearPull: Shortcut[] = [{ key: 'c' }]
const pullUp: Shortcut[] = [{ key: 'ArrowUp' }, { key: 'Tab', mod: { shift: true } }]
const pullDown: Shortcut[] = [{ key: 'ArrowDown' }, { key: 'Tab' }]
const selectPullNumber: Shortcut[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => ({
  key: n.toString(),
}))

export function keyText({ key, mod }: Shortcut) {
  let text = ''

  if (mod?.ctrl) text += 'Ctrl+'
  if (mod?.shift) text += 'Shift+'

  if (key === 'Delete') text += 'Del'
  else text += key.toUpperCase()

  return text
}

export const shortcuts = {
  undo,
  redo,
  backspacePull,
  deletePull,
  appendPull,
  prependPull,
  clearPull,
  pullUp,
  pullDown,
  selectPullNumber,
} as const
