import type { mutex } from 'lib0/mutex'
import type * as Y from 'yjs'
import type * as awarenessProtocol from 'y-protocols/awareness'
import * as ws from 'lib0/websocket'
import { ObservableV2 } from 'lib0/observable'

export class WebrtcConn {
  /**
   * @param {SignalingConn} signalingConn
   * @param {boolean} initiator
   * @param {string} remotePeerId
   * @param {Room} room
   */
  constructor(signalingConn: SignalingConn, initiator: boolean, remotePeerId: string, room: Room)
  room: Room
  remotePeerId: string
  glareToken: number
  closed: boolean
  connected: boolean
  synced: boolean
  /**
   * @type {any}
   */
  peer: any
  destroy(): void
}
export class Room {
  /**
   * @param {Y.Doc} doc
   * @param {WebrtcProvider} provider
   * @param {string} name
   * @param {CryptoKey|null} key
   */
  constructor(doc: Y.Doc, provider: WebrtcProvider, name: string, key: CryptoKey | null)
  /**
   * Do not assume that peerId is unique. This is only meant for sending signaling messages.
   *
   * @type {string}
   */
  peerId: string
  doc: Y.Doc
  /**
   * @type {awarenessProtocol.Awareness}
   */
  awareness: awarenessProtocol.Awareness
  provider: WebrtcProvider
  synced: boolean
  name: string
  key: CryptoKey
  /**
   * @type {Map<string, WebrtcConn>}
   */
  webrtcConns: Map<string, WebrtcConn>
  /**
   * @type {Set<string>}
   */
  bcConns: Set<string>
  mux: mutex
  bcconnected: boolean
  expectedNumberOfClients: number | null
  /**
   * @param {ArrayBuffer} data
   */
  _bcSubscriber: (data: ArrayBuffer) => PromiseLike<any>
  /**
   * Listens to Yjs updates and sends them to remote peers
   *
   * @param {Uint8Array} update
   * @param {any} _origin
   */
  _docUpdateHandler: (update: Uint8Array, _origin: any) => void
  /**
   * Listens to Awareness updates and sends them to remote peers
   *
   * @param {any} changed
   * @param {any} _origin
   */
  _awarenessUpdateHandler: ({ added, updated, removed }: any, _origin: any) => void
  _beforeUnloadHandler: () => void
  connect(): void
  disconnect(): void
  destroy(): void
}
export class SignalingConn extends ws.WebsocketClient {
  constructor(url: any)
  /**
   * @type {Set<WebrtcProvider>}
   */
  providers: Set<WebrtcProvider>
}
/**
 * @typedef {Object} WebrtcProviderEvents
 * @property {function({connected:boolean}):void} WebrtcProviderEvent.status
 * @property {function({synced:boolean}):void} WebrtcProviderEvent.synced
 * @property {function({added:Array<string>,removed:Array<string>,webrtcPeers:Array<string>,bcPeers:Array<string>}):void} WebrtcProviderEvent.peers
 */
/**
 * @extends ObservableV2<WebrtcProviderEvents>
 */
export class WebrtcProvider extends ObservableV2<WebrtcProviderEvents> {
  /**
   * @param {string} roomName
   * @param {Y.Doc} doc
   * @param {ProviderOptions?} opts
   */
  constructor(
    roomName: string,
    doc: Y.Doc,
    { signaling, password, awareness, maxConns, filterBcConns, peerOpts }?: ProviderOptions | null,
  )
  roomName: string
  doc: Y.Doc
  filterBcConns: boolean
  /**
   * @type {awarenessProtocol.Awareness}
   */
  awareness: awarenessProtocol.Awareness
  shouldConnect: boolean
  signalingUrls: string[]
  signalingConns: SignalingConn[]
  maxConns: number
  peerOpts: any
  /**
   * @type {PromiseLike<CryptoKey | null>}
   */
  key: PromiseLike<CryptoKey | null>
  /**
   * @type {Room|null}
   */
  room: Room | null
  /**
   * Indicates whether the provider is looking for other peers.
   *
   * Other peers can be found via signaling servers or via broadcastchannel (cross browser-tab
   * communication). You never know when you are connected to all peers. You also don't know if
   * there are other peers. connected doesn't mean that you are connected to any physical peers
   * working on the same resource as you. It does not change unless you call provider.disconnect()
   *
   * `this.on('status', (event) => { console.log(event.connected) })`
   *
   * @type {boolean}
   */
  get connected(): boolean
  connect(): void
  disconnect(): void
}
export type ProviderOptions = {
  signaling?: Array<string>
  password?: string
  awareness?: awarenessProtocol.Awareness
  maxConns?: number
  filterBcConns?: boolean
  peerOpts?: any
}
export type WebrtcProviderEvents = {
  status: (arg0: { connected: boolean }) => void
  synced: (arg0: { synced: boolean }) => void
  peers: (arg0: {
    added: Array<string>
    removed: Array<string>
    webrtcPeers: Array<string>
    bcPeers: Array<string>
  }) => void
}
