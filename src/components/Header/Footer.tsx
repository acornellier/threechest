import { Button } from '../Common/Button.tsx'
import { DiscordIcon } from '../Common/Icons/DiscordIcon.tsx'
import { GithubIcon } from '../Common/Icons/GithubIcon.tsx'
import { KofiIcon } from '../Common/Icons/KofiIcon.tsx'

export function Footer() {
  return (
    <div className="fixed bottom-0 right-0 z-20">
      <div className="my-1 mx-2 flex items-center gap-2 h-[48px]">
        <a href="https://discord.com/invite/Ykb6AbYHHZ" target="_blank" rel="noreferrer">
          <Button Icon={DiscordIcon} />
        </a>
        <a href="https://github.com/acornellier/keys" target="_blank" rel="noreferrer">
          <Button Icon={GithubIcon} />
        </a>
        <a href="https://ko-fi.com/ortemis" target="_blank" rel="noreferrer">
          <Button Icon={KofiIcon} iconSize={24}>
            Donate
          </Button>
        </a>
      </div>
    </div>
  )
}
