import { Performance, Connection } from "../../../db"
import { IActionElements } from "../";
import { IMessagePayload } from "../messager";

export async function connectSourceAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  const { params } = body
  const { connectionId } = event.requestContext
  const updatedParams = { source: params.source }
  const queries = [Connection.updateByAWSID(connectionId, updatedParams)]
  if (params.source !== 'control') {
    queries.push(Performance.getActive())
  }
  const [currentConnection, activePerformances] = await Promise.all(queries)
  const payload: IMessagePayload = {
    action: 'conn-update',
    params: { currentConnection, activePerformances }
  }
  await messager.sendToSender({ event, payload }, sockets)
}