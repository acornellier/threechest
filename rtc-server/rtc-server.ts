import express from 'express'
import { WebSocket, WebSocketServer } from 'ws'

class WebSocketEx extends WebSocket {
  isAlive?: boolean
}

interface SubscribeMessage {
  type: 'subscribe'
  topics: string[]
}

interface PublishMessage {
  type: 'publish'
  topic: string
  clients?: number
}

interface UnsubscribeMessage {
  type: 'unsubscribe'
  topics: string[]
}

interface PingMessage {
  type: 'ping'
}

const topics = new Map<string, Set<WebSocketEx>>()
const PORT = process.env.PORT || 8787

const server = express().listen(PORT, () => console.log(`Listening on ${PORT}`))

const wss = new WebSocketServer<typeof WebSocketEx>({ server })

type Message = SubscribeMessage | PublishMessage | UnsubscribeMessage | PingMessage

const isValidMessage = (message: any): message is Message =>
  !!message && typeof message === 'object' && message.type

const onConnection = (socket: WebSocketEx) => {
  socket.on('error', console.error)
  socket.isAlive = true

  const subscribedTopics = new Set<string>()

  socket
    .on('message', (data) => {
      const message = JSON.parse(data.toString())

      if (!isValidMessage(message)) {
        console.error(`Invalid message: ${message}`)
        return
      }

      if (message.type === 'subscribe') {
        console.log('SUBSCRIBE MESSAGE RECEIVED!')
        message.topics.forEach((topicName) => {
          subscribedTopics.add(topicName)

          const subscribers = topics.get(topicName) || new Set()
          subscribers.add(socket)

          if (!topics.has(topicName)) {
            topics.set(topicName, subscribers)
          }
        })
      } else if (message.type === 'publish') {
        const subscribers = topics.get(message.topic) || new Set()

        message.clients = subscribers.size

        subscribers.forEach((subscriber) => {
          // DO send publish messages to self so that it knows it's alone in the room
          // if (socket === subscriber) return // Don't send publish messages to self
          subscriber.send(JSON.stringify(message))
        })
      } else if (message.type === 'unsubscribe') {
        message.topics.forEach((topicName) => {
          const subscribers = topics.get(topicName)

          if (subscribers) {
            subscribers.delete(socket)
          }
        })
      } else if (message.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }))
        socket.isAlive = true
      } else {
        console.log(`Unhandled message: ${message}`)
      }
    })
    .on('close', (code) => {
      subscribedTopics.forEach((topicName) => {
        const subscribers = topics.get(topicName) || new Set()
        subscribers.delete(socket)
        if (subscribers.size === 0) {
          topics.delete(topicName)
        }
      })
      subscribedTopics.clear()

      if (code === 1005) {
        socket.terminate()
      }
    })
}

wss.on('connection', onConnection)
wss.on('close', () => {
  clearInterval(checkAliveInterval)
})

const checkAliveInterval = setInterval(() => {
  wss.clients.forEach((socket) => {
    if (socket.isAlive === false) return socket.terminate()

    socket.isAlive = false
  })
}, 30000)
