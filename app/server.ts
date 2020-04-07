import * as WebSocket from 'ws'
import { dbConnection } from '../db'
import { manageEvent } from './actions'
import { Connection } from '../db/connections'

const wss = new WebSocket.Server({ port: 8080 })
console.warn(`Websockets listening on wss://localhost:${wss.options.port}`)
dbConnection()

wss.on('connection', async ws => {

  console.log('CONNECT------\n')
  const createParams = {
    performance_id: 10001,
    aws_connection_id: 'test',
    attendee_id: null,
    source: null
  }
  const conn = await Connection.create(createParams)
  ws.send(JSON.stringify({ action: 'local-server', currentConn: conn.rows[0] }))

  ws.on('message', async message => {

    console.log(`Received message => ${message}`)
    await manageEvent(formatAsAWSEvent(message))

    // wss.clients.forEach(function each(client) {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(formatAsAWSMessage(payload));
    //   }
    // });  
  })

})

function formatAsAWSEvent(message) {
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
      connectionId: "LOCAL_KEY_DUDE",
      apiId: "g298l0uqlc"
    },
    body: message,
    isBase64Encoded: false
  }
}
