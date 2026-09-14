import { Modal } from '../Common/Modal.tsx'
import { changelog, unseenChangelogIds } from '../../data/changelog.ts'

interface Props {
  lastSeenId: string | null
  onClose: () => void
}

export function WhatsNewModal({ lastSeenId, onClose }: Props) {
  const unseenIds = unseenChangelogIds(lastSeenId)

  return (
    <Modal
      title="What's New"
      width={640}
      onClose={onClose}
      closeOnEscape
      closeOnClickOutside
      closeButton
      contents={
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {changelog.map(({ month, entries }) => (
              <div key={month}>
                <div className="text-lg font-bold">{month}</div>
                <div className="flex flex-col gap-2 mt-1">
                  {entries.map(({ id, title, description }) => (
                    <div key={id}>
                      <div className="flex items-center gap-2">
                        <div className="font-bold">{title}</div>
                        {unseenIds.has(id) && (
                          <div className="rounded bg-fancy-red px-1 text-xs">NEW</div>
                        )}
                      </div>
                      <div className="text-gray-300">{description}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="text-gray-300">
            Full history on{' '}
            <a
              className="text-blue-500 hover:underline"
              href="https://github.com/acornellier/threechest/commits/main"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </div>
        </div>
      }
    />
  )
}
