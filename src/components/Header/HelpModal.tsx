import { Modal } from '../Common/Modal.tsx'
import { keyText, shortcuts } from '../../data/shortcuts.ts'
import { isMac } from '../../util/dev.ts'

interface Props {
  onClose: () => void
}

const shortcutDescriptions = [
  { desc: 'Undo', shortcuts: shortcuts.undo },
  { desc: 'Redo', shortcuts: shortcuts.redo },
  { desc: 'Select next pull', shortcuts: shortcuts.pullDown },
  { desc: 'Select previous pull', shortcuts: shortcuts.pullUp },
  { desc: 'Add pull after selected', shortcuts: shortcuts.appendPull },
  { desc: 'Add pull to end', shortcuts: shortcuts.addPull },
  { desc: 'Add pull before selected', shortcuts: shortcuts.prependPull },
  { desc: 'Clear selected pull', shortcuts: shortcuts.clearPull },
  { desc: 'Delete selected pull', shortcuts: shortcuts.deletePull.concat(shortcuts.backspacePull) },
  { desc: 'Toggle drawing mode', shortcuts: shortcuts.draw },
  { desc: 'Show help menu', shortcuts: shortcuts.help },
]
  .map(({ desc, shortcuts }) => ({ desc, texts: shortcuts.map((shortcut) => keyText(shortcut)) }))
  .filter(({ texts }) => texts.length)
  .concat({ desc: 'Select pull #', texts: ['1-9'] })

export function HelpModal({ onClose }: Props) {
  return (
    <Modal
      title="Help"
      width={770}
      onClose={onClose}
      closeOnEscape
      closeOnClickOutside
      closeButton
      contents={
        <div className="flex flex-col sm:flex-row sm:gap-8">
          <div>
            <div className="text-lg font-bold mt-2">Contact</div>
            <div>
              Join the{' '}
              <a
                className="text-blue-500 hover:underline"
                href="https://discord.gg/btHjKxn7YB"
                target="_blank"
                rel="noreferrer"
              >
                discord
              </a>{' '}
              with any questions you want!
            </div>
            <div>Or contact me directly on discord at @ortemis.</div>
            <div className="text-lg font-bold mt-2">Basics</div>
            <div>
              Left click mobs to select them 1 group at a time, adding them to your currently
              selected pull.
            </div>
            <div>
              Your pulls are displayed in the right sidebar. Right click or hold your finger on them
              to insert or delete pulls.
            </div>
            <div>Select dungeon and route using the dropdowns at the top.</div>
            <div>Any changes you make are immediately saved to your browser.</div>
            <div className="text-lg font-bold mt-2">Advanced tips</div>
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
              Hold <span className="rounded bg-fancy-red px-1 min-w-6 text-center">Shift</span> to
              view total forces instead of %.
            </div>
            <div className="text-lg font-bold mt-2">Collab</div>
            <div>
              Start a collab with the Start Collab button. This creates a public room, that anybody
              can join and edit your route with you.
            </div>
            <div>
              The creator of the collab room is the host and is the only person who can change the
              dungeon or route. Any change made to the collab route is a change made to the
              host&apos;s saved route.
            </div>
            <div>
              People who join are guests, and can edit the route but not change the active route.
              Changes are not saved to their browser unless they leave, or choose to save it.
            </div>
          </div>
          <div>
            <div className="text-lg font-bold mt-2">Shortcuts</div>
            <div className="flex flex-col gap-1 whitespace-nowrap">
              {shortcutDescriptions.map(({ desc, texts }) => (
                <div key={desc} className="flex justify-between gap-4">
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
        </div>
      }
    />
  )
}
