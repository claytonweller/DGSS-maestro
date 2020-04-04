import * as WebSocket from 'ws'
import { dbConnection } from '../db'

const wss = new WebSocket.Server({ port: 8080 })
console.warn(`Websockets listening on wss://localhost:${wss.options.port}`)

dbConnection()

wss.on('connection', async ws => {

  console.log('CONNECT')

  ws.on('message', message => {
    console.log(`Received message => ${message}`)
    const payload = JSON.parse(message)
    if (payload.count > 4) {
      ws.send(formatAsAWSMessage('YOU DID IT!'))
    }

    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(formatAsAWSMessage(payload));
      }
    });
  })

})


function formatAsAWSMessage(message) {
  return JSON.stringify({
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
      connectionId: "KG99ceyYIAMCK8w=",
      apiId: "g298l0uqlc"
    },
    body: message,
    isBase64Encoded: false
  })
}
