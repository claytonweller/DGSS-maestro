import * as WebSocket from 'ws'
import { IMessager } from './actions/messager'

export const localMessager: IMessager = {
  sendToSender,
  sendToAll,
  sendToIds
}

async function sendToSender(params, sockets) {
  return await sockets.ws.send(JSON.stringify(params.payload))
}

async function sendToAll(params, sockets) {
  await sockets.wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(params.payload));
    }
  })
}

async function sendToIds(params, sockets) {
  return await sockets.ws.send(JSON.stringify(params.payload))
}

// interface IGateWayParams {
//   event: ILambdaEvent,
//   connectionId: string | null,
//   payload: IMessagePayload
// }

// interface ILambdaEvent {
//   requestContext: {
//     routeKey: string
//     messageId: string
//     eventType: string
//     extendedRequestId: string
//     requestTime: string
//     messageDirection: string
//     stage: string
//     connectedAt: number
//     requestTimeEpoch: number
//     requestId: string
//     domainName: string
//     connectionId: string
//     apiId: string
//   },
//   body: any,
//   isBase64Encoded: boolean
// }

// interface IMessagePayload {
//   action: string,
//   params: any
// }