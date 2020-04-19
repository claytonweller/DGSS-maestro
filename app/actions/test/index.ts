import { Connection } from "../../../db"
import { IActionElements } from "../";

export async function allAction(actionElements: IActionElements) {
  const { event, messager, sockets } = actionElements
  await messager.sendToAll({ event, payload: { action: 'all', params: {} } }, sockets)
}

async function randomAction(actionElements: IActionElements) {
  const { event, messager, sockets } = actionElements
  const connections = await Connection.getAll()
  const randomConnection = connections[Math.floor(Math.random() * connections.length)]
  const ranomAWSId = randomConnection.aws_connection_id
  await messager.sendToIds(
    { event, payload: { action: 'rand', params: {} }, ids: [ranomAWSId] },
    sockets
  )
}

async function sourceAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  const connections = await Connection.getBySource(body.params.source)
  const ids = connections.map(con => con.aws_connection_id)
  await messager.sendToIds(
    { event, payload: { action: 'source', params: {} }, ids },
    sockets
  )
}

export const testActionHash = {
  'all': allAction,
  'source': sourceAction,
  'random': randomAction
}