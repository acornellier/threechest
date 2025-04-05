declare namespace Twitch {
  class Embed {
    constructor(elementId: string, options: EmbedOptions)

    addEventListener(eventType: string, listener: (event: any) => void): void

    removeEventListener(eventType: string, listener: (event: any) => void): void

    setMuted(muted: boolean): void
  }

  interface EmbedOptions {
    width: number
    height: number
    channel: string
    layout: string
    autoplay: boolean
    muted: boolean
    theme: string
    parent: string[]
  }

  class Player {
    static readonly READY: string
    static readonly ONLINE: string
    static readonly OFFLINE: string
  }
}
