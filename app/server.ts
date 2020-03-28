import * as WebSocket from 'ws'
import { dbConnection } from '../db'
import { Connection } from "../db/connections";

const wss = new WebSocket.Server({ port: 8080 })
console.warn(`Websockets listening on wss://localhost:${wss.options.port}`)

dbConnection()

// async function getAttendees() {
//   console.log('MAKING THE ATTEMPT')
//   try {
//     const params = {
//       performance_id: 1,
//       attendee_id: 1,
//       aws_connection_id: 'string',
//       source: 'string'
//     }
//     await Connection.create(params);
//     console.log('inserted')
//     const connections = await Connection.getAll()
//     console.log(connections.rows[0])
//     await Connection.remove(connections.rows[0].id)
//     const updateConnections = await Connection.getAll()
//     console.log(updateConnections.rows[0])

//   } catch (e) {
//     console.error(e)
//   }
// }

// getAttendees()

wss.on('connection', async ws => {

  console.log('CONNECT')

  const params = {
    performance_id: 1,
    attendee_id: 1,
    aws_connection_id: 'string',
    source: 'Crowd'
  }
  const connection = await Connection.create(params)
  console.warn(connection.rows[0].id)
  ws.send(formatAsAWSMessage(connection.rows[0].id))

  ws.on('close', async message => {
    console.log(message)
    console.log('CLOSE')
    const connections = await Connection.getAll()
    await Connection.removeByConnectionId(connections.rows[0].id)
  })

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
