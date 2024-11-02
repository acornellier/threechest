import { Button } from '../Common/Button.tsx'
import { DiscordIcon } from '../Common/Icons/DiscordIcon.tsx'
import { GithubIcon } from '../Common/Icons/GithubIcon.tsx'
import { KofiIcon } from '../Common/Icons/KofiIcon.tsx'
import { useCallback, useState } from 'react'
import { HelpModal } from './HelpModal.tsx'
import { useShortcut } from '../../util/hooks/useShortcut.ts'
import { shortcuts } from '../../data/shortcuts.ts'
import { useRootSelector } from '../../store/storeUtil.ts'
import { isMobile } from '../../util/dev.ts'
import { selectIsLive } from '../../store/reducers/mapReducer.ts'

export function Footer() {
  const isLive = useRootSelector(selectIsLive)
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const sidebarCollapsed = useRootSelector((state) => state.map.sidebarCollapsed)

  const onHelp = useCallback(() => setHelpModalOpen(true), [])
  useShortcut(shortcuts.help, onHelp)

  if ((sidebarCollapsed && isMobile) || isLive) return false

  return (
    <>
      <div className="fixed bottom-0 z-20 transition-all">
        <div className="my-1 mx-2 flex items-center gap-2 h-[48px]">
          <a href="https://ko-fi.com/ortemis" target="_blank" rel="noreferrer">
            <Button Icon={KofiIcon} iconSize={24}>
              Donate
            </Button>
          </a>
          <a href="https://github.com/acornellier/threechest" target="_blank" rel="noreferrer">
            <Button Icon={GithubIcon} />
          </a>
          <a href="https://discord.gg/btHjKxn7YB" target="_blank" rel="noreferrer">
            <Button Icon={DiscordIcon} />
          </a>
          <Button justifyStart onClick={() => setHelpModalOpen(true)}>
            Help
          </Button>
        </div>
      </div>
      {helpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}
    </>
  )
}
