import { Modal } from '../Common/Modal.tsx'
import { keyText, shortcuts } from '../../data/shortcuts.ts'
import { isMac } from '../../util/dev.ts'

interface Props {
  onClose: () => void
}

const shortcutDescriptions = [
  { desc: 'Show help menu', shortcuts: shortcuts.help },
  { desc: 'Undo', shortcuts: shortcuts.undo },
  { desc: 'Redo', shortcuts: shortcuts.redo },
  { desc: 'Select next pull', shortcuts: shortcuts.pullDown },
  { desc: 'Select previous pull', shortcuts: shortcuts.pullUp },
  { desc: 'Add pull after selected', shortcuts: shortcuts.appendPull },
  { desc: 'Add pull to end', shortcuts: shortcuts.addPull },
  { desc: 'Add pull before selected', shortcuts: shortcuts.prependPull },
  { desc: 'Clear selected pull', shortcuts: shortcuts.clearPull },
  { desc: 'Delete selected pull', shortcuts: shortcuts.deletePull.concat(shortcuts.backspacePull) },
]
  .map(({ desc, shortcuts }) => ({ desc, texts: shortcuts.map((shortcut) => keyText(shortcut)) }))
  .filter(({ texts }) => texts.length)
  .concat({ desc: 'Select pull #', texts: ['1-9'] })

export function HelpModal({ onClose }: Props) {
  return (
    <Modal
      title="Help"
      onClose={onClose}
      closeOnEscape
      closeOnClickOutside
      contents={
        <div>
          <div>
            <span className="rounded bg-fancy-red px-1 min-w-6 text-center">
              {isMac ? 'Cmd' : 'Ctrl'} + click
            </span>{' '}
            to select indivudal mobs.
          </div>
          <div>
            <span className="rounded bg-fancy-red px-1 min-w-6 text-center">Shift + drag</span> to
            select multiple mobs at once.
          </div>
          <div>
            Any other questions? Contact me on{' '}
            <a
              className="text-blue-500 hover:underline"
              href="https://discord.com/invite/Ykb6AbYHHZ"
              target="_blank"
              rel="noreferrer"
            >
              discord
            </a>
            .
          </div>
          <div className="text-lg font-bold mt-2">Shortcuts</div>
          <div className="flex flex-col gap-1">
            {shortcutDescriptions.map(({ desc, texts }) => (
              <div key={desc} className="flex justify-between">
                <div>{desc}</div>
                <div className="flex gap-2">
                  {texts.map((text) => (
                    <div key={text} className="rounded bg-fancy-red px-1 min-w-6 text-center">
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  )
}
