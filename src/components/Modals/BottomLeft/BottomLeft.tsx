import { MobInfo } from '../MobInfo.tsx'
import { TwitchStream } from '../TwitchStream.tsx'
import { useLocalStorage } from '../../../util/hooks/useLocalStorage.ts'
import { isDev } from '../../../util/isDev.ts'

export function BottomLeft() {
  const [blockTwitch, setBlockTwitch] = useLocalStorage('blockTwitch', false)

  return (
    <div className="fixed bottom-14 left-2 z-10 min-w-[320px]">
      {!blockTwitch && !isDev && <TwitchStream setBlockTwitch={setBlockTwitch} />}
      <MobInfo />
    </div>
  )
}
