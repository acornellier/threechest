import type * as React from 'react'
import { memo, useEffect, useRef, useState } from 'react'
import { useExternalScript } from '../../util/hooks/useExternalScript.ts'
import { Button } from '../Common/Button.tsx'
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Modal } from '../Common/Modal.tsx'

const channel = 'ortemismw'
const videoWidth = 320
const videoHeight = videoWidth * (9 / 16)

interface Props {
  setBlockTwitch: (val: boolean) => void
}

function TwitchStreamComponent({ setBlockTwitch }: Props) {
  const [isTwitchVisible, setTwitchVisible] = useState(false)
  const [helpModalOpen, setHelpModalOpen] = useState(false)

  const scriptStatus = useExternalScript('/twitch_v1.js')
  const twitchLoaded = useRef(false)

  function handleClose(e: React.MouseEvent) {
    setTwitchVisible(false)
    if (e.altKey && e.shiftKey) {
      setBlockTwitch(true)
    }
  }

  useEffect(() => {
    if (scriptStatus !== 'ready' && !twitchLoaded.current) return

    twitchLoaded.current = true
    const player = new Twitch.Embed('twitch-embed', {
      width: videoWidth,
      height: videoHeight,
      channel,
      layout: 'video',
      autoplay: true,
      muted: true,
      theme: 'dark',
      parent: [window.location.hostname],
    })

    player.addEventListener(Twitch.Player.READY, initiate)

    function initiate() {
      player.addEventListener(Twitch.Player.ONLINE, handleOnline)
      player.addEventListener(Twitch.Player.OFFLINE, handleOffline)
      player.removeEventListener(Twitch.Player.READY, initiate)
    }

    function handleOnline() {
      setTwitchVisible(true)
      player.removeEventListener(Twitch.Player.ONLINE, handleOnline)
      player.addEventListener(Twitch.Player.OFFLINE, handleOffline)
    }

    function handleOffline() {
      setTwitchVisible(false)
      player.removeEventListener(Twitch.Player.OFFLINE, handleOffline)
      player.addEventListener(Twitch.Player.ONLINE, handleOnline)
    }
  }, [scriptStatus])

  return (
    <div className={isTwitchVisible ? '' : 'hidden'}>
      <div className="flex flex-col">
        <div className="flex justify-between">
          <Button
            short
            twoDimensional
            Icon={QuestionMarkCircleIcon}
            onClick={() => setHelpModalOpen(true)}
          >
            Closing permanently
          </Button>
          <Button short twoDimensional Icon={XMarkIcon} onClick={handleClose} />
        </div>
        <div id="twitch-embed" />
      </div>
      {helpModalOpen && (
        <Modal
          title="Closing Twitch embed permanently"
          onClose={() => setHelpModalOpen(false)}
          closeOnEscape
          closeOnClickOutside
          contents={
            <>
              <p>
                This embed of my personal stream is the only source of income I get from this
                website. I understand that it can be annoying to have to close it every time you
                open the page.
              </p>
              <p>
                To close it permanently, please donate any amount and message me in Discord @ortemis
                and I will tell you how. Or if you are making content using Threechest, I will let
                you know for free!
              </p>
            </>
          }
        />
      )}
    </div>
  )
}

export const TwitchStream = memo(TwitchStreamComponent)
