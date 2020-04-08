import { Connection } from "../../db/connections"

export const manageEvent = async (event, messager, sockets = {}) => {
  console.log('BODY', event.body)
  const message = JSON.parse(event.body)
  if (message.action === 'connect-source') {
    const { params } = message
    const { connectionId } = event.requestContext
    const updatedParams = {
      source: params.source
    }
    const currentConnection = await Connection.updateByAWSID(connectionId, updatedParams)
    await messager.sendToSender(
      { event, connectionId, payload: { action: 'conn-update', params: currentConnection } },
      sockets
    )
  }
  if (message.action === 'all') {
    await messager.sendToAll({ event, payload: { action: 'test' } }, sockets)
  }
}
