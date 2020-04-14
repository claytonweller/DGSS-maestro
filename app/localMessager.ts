import * as WebSocket from 'ws'
import {
  IMessager,
  IMessagePayload,
  ILambdaEvent
} from './actions/messager'

export const localMessager: IMessager = {
  sendToSender,
  sendToAll,
  sendToIds
}

async function sendToSender(
  { event, payload }: { event: ILambdaEvent, payload: IMessagePayload },
  sockets
) {
  return await sockets.ws.send(JSON.stringify(payload))
}

async function sendToAll(
  { event, payload }: { event: ILambdaEvent, payload: IMessagePayload },
  sockets
) {
  await sockets.wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  })
}

async function sendToIds(
  { event, payload, ids }: { event: ILambdaEvent, payload: IMessagePayload, ids: string[] },
  sockets
) {
  const messages = ids.map(id => {
    if (sockets.clients[id]) {
      return sockets.clients[id].send(JSON.stringify(payload))
    }
    return null
  })

  await Promise.all(messages)
}