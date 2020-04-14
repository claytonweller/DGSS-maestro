import { Connection } from "../../db/connections"
import { ILambdaEvent, IMessagePayload, IMessager } from "./messager";

// In order to keep the local and prod development separate we send through a specifi 'messager'
// function for each environment that knows how to handle events in its respective context 
// The 'sockets' param is only used in local development. Handlers are entirely event driven.
export const manageEvent = async (event: ILambdaEvent, messager: IMessager, sockets = {}) => {
  console.log('BODY', event.body)
  const body = JSON.parse(event.body)
  const action = Object.keys(actionHash).includes(body.action)
    ? actionHash[body.action]
    : actionHash.defaultAction

  const actionElements = {
    body, // This is the information FROM the client
    event, // This is the metadata about the connection to the lambdaHandler (includes body)
    messager, // This is the way we manage websocket connections
    sockets // This is only used in the local case
  }

  try {
    await action(actionElements)
  } catch (e) {
    console.error(e)
  }
}

const actionHash = {
  defaultAction,
  'connect-source': connectSourceAction,
  'all': allAction,
  'source': sourceAction,
  'random': randomAction
}

// This function is required for the app to work
async function connectSourceAction(actionElements) {
  const { body, event, messager, sockets } = actionElements
  const { params } = body
  const { connectionId } = event.requestContext
  const updatedParams = { source: params.source }
  const currentConnection = await Connection.updateByAWSID(connectionId, updatedParams)
  const payload: IMessagePayload = { action: 'conn-update', params: currentConnection }
  await messager.sendToSender({ event, payload }, sockets)
}

// These are all test actions anc can be deleted at any time
async function allAction(actionElements) {
  const { event, messager, sockets } = actionElements
  await messager.sendToAll({ event, payload: { action: 'all', params: {} } }, sockets)
}

async function randomAction(actionElements) {
  const { event, messager, sockets } = actionElements
  const connections = await Connection.getAll()
  const randomConnection = connections[Math.floor(Math.random() * connections.length)]
  const ranomAWSId = randomConnection.aws_connection_id
  await messager.sendToIds(
    { event, payload: { action: 'rand', params: {} }, ids: [ranomAWSId] },
    sockets
  )
}

async function sourceAction(actionElements) {
  const { body, event, messager, sockets } = actionElements
  const connections = await Connection.getBySource(body.params.source)
  const ids = connections.map(con => con.aws_connection_id)
  await messager.sendToIds(
    { event, payload: { action: 'source', params: {} }, ids },
    sockets
  )
}

async function defaultAction(actionElements) { console.log('DEFAULT CATCH ALL') }