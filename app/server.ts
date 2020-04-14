import * as WebSocket from 'ws'
import { dbConnection } from '../db'
import { manageEvent } from './actions'
import { Connection } from '../db/connections'
import { localMessager } from './localMessager'
import * as AWS from 'aws-sdk'
AWS.config.update({ region: 'us-east-1' })

const wss = new WebSocket.Server({ port: 8080 })
const clients = {}
console.warn(`Websockets listening on wss://localhost:${wss.options.port}`)
dbConnection()
Connection.removeAll()

wss.on('connection', async (ws, req) => {
  console.log('CONNECT------\n')
  const awsId = req.headers['sec-websocket-key']
  clients[awsId] = ws
  const createParams = {
    performance_id: 10001,
    aws_connection_id: awsId,
    attendee_id: null,
    source: null
  }
  const conn = await Connection.create(createParams)
  console.log('CREATED: ', awsId)
  ws.send(JSON.stringify({ action: 'local-server', currentConn: conn }))

  ws.on('message', async message => {

    console.log(`Received message => ${message}`)
    await manageEvent(formatAsAWSEvent(message, awsId), localMessager, { ws, wss, clients })
  })

  ws.on('close', async () => {
    await Connection.removeByConnectionId(awsId)
    delete clients[awsId]
    console.log('DELTED: ', awsId)
    console.log('Clients remaining - ', Object.keys(clients).length)
  })

})

function formatAsAWSEvent(message, id) {
  return {
    requestContext: {
      routeKey: "$default",
      messageId: "KG99mey_IAMCK8w=",
      eventType: "MESSAGE",
      extendedRequestId: "KG99mGiKoAMF4pQ=",
      requestTime: "28/Mar/2020:16:09:33 +0000",
      messageDirection: "IN",
      stage: "dev",
      connectedAt: 1585411772322,
      requestTimeEpoch: 1585411773360,
      identity: { cognitoIdentityPoolId: null, cognitoIdentityId: null, principalOrgId: null, cognitoAuthenticationType: null, userArn: null },
      requestId: "KG99mGiKoAMF4pQ=",
      domainName: "g298l0uqlc.execute-api.us-east-1.amazonaws.com",
      connectionId: id,
      apiId: "g298l0uqlc"
    },
    body: message,
    isBase64Encoded: false
  }
}
