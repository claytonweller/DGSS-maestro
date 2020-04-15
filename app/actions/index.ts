import { Performance, Audience, Connection } from "../../db"
import { ILambdaEvent, IMessagePayload, IMessager } from "./messager";
import { DateTime } from "luxon";


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
  'create-performance': createPerformance,
  'end-performance': endPerformance,
  'connect-source': connectSourceAction,
  'all': allAction,
  'source': sourceAction,
  'random': randomAction
}

// This function is required for the app to work
async function connectSourceAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  const { params } = body
  const { connectionId } = event.requestContext
  const updatedParams = { source: params.source }
  const currentConnection = await Connection.updateByAWSID(connectionId, updatedParams)
  const payload: IMessagePayload = { action: 'conn-update', params: currentConnection }
  await messager.sendToSender({ event, payload }, sockets)
}

async function createPerformance(actionElements: IActionElements) {
  const { event, messager, sockets } = actionElements
  const control_aws_id = event.requestContext.connectionId
  const performanceParams = {
    control_aws_id,
    current_module_title: 'preshow'
  }
  const performance = await Performance.create(performanceParams)
  const queries = [
    Connection.updateByAWSID(control_aws_id, { performance_id: performance.id }),
    Audience.create({ performance_id: performance.id, size: 0 }),
    Connection.removeAll(performance.id)
  ]
  const res = await Promise.all(queries)
  const updatedPerformance = await Performance.update(performance.id, { audience_id: res[1].id })
  const payload = { action: 'performance-created', params: updatedPerformance }
  messager.sendToSender({ event, payload }, sockets)
}

async function endPerformance(actionElements: IActionElements) {
  const { event, body, messager, sockets } = actionElements
  await Performance.update(body.params.id, { ended_at: DateTime.local().toISO() })
  const payload = {
    action: 'performance-ended',
    params: {}
  }
  messager.sendToAll({ event, payload }, sockets)
}

// These are all test actions anc can be deleted at any time
async function allAction(actionElements: IActionElements) {
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

async function defaultAction(actionElements: IActionElements) { console.log(actionElements) }

interface IActionElements {
  event: ILambdaEvent,
  body: IMessagePayload,
  messager: IMessager,
  sockets: any
}