import { Connection } from "../../db/connections"
import { ILambdaEvent, IMessagePayload, IMessager } from "./messager";

// In order to keep the local and prod development separate we send through a specifi 'messager'
// function for each environment that knows how to handle events in its respective context 
// The 'sockets' param is only used in local development. Handlers are entirely event driven.
export const manageEvent = async (event: ILambdaEvent, messager: IMessager, sockets = {}) => {
  console.log('BODY', event.body)
  const message = JSON.parse(event.body)
  if (message.action === 'connect-source') {
    const { params } = message
    const { connectionId } = event.requestContext
    const updatedParams = { source: params.source }
    const currentConnection = await Connection.updateByAWSID(connectionId, updatedParams)
    const payload: IMessagePayload = { action: 'conn-update', params: currentConnection }
    await messager.sendToSender({ event, payload }, sockets)
  }

  if (message.action === 'all') {
    await messager.sendToAll({ event, payload: { action: 'all', params: {} } }, sockets)
  }

  if (message.action === 'random') {
    const connections = await Connection.getAll()
    const randomConnection = connections[Math.floor(Math.random() * connections.length)]
    const ranomAWSId = randomConnection.aws_connection_id
    await messager.sendToIds(
      { event, payload: { action: 'rand', params: {} }, ids: [ranomAWSId] },
      sockets
    )
  }

  if (message.action === 'source') {
    const connections = await Connection.getBySource(message.params.source)
    const ids = connections.map(con => con.aws_connection_id)
    await messager.sendToIds(
      { event, payload: { action: 'source', params: {} }, ids },
      sockets
    )
  }
}
