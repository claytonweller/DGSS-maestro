import { IActionElements } from "../";
import { Connection, Attendee, AuidenceAttendee } from "../../../db"
import { IMessagePayload } from "../messager";

export async function joinPerformanceAction(actionElements: IActionElements) {
  const { source } = actionElements.body.params
  if (source === 'crowd') {
    await attendeeJoin(actionElements)
  } else if (source === 'display') {
    await displayJoin(actionElements)
  }
  // TODO add in a message if these don't work out
}

async function attendeeJoin(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  const name = body.params.name ? body.params.name : 'Anonymous'

  const { audience_id, performance_id } = body.params
  // TODO eventually make it able to find exsiting attendees to attache them to shows
  const attendee = await Attendee.create({ name })
  const conParams = {
    attendee_id: attendee.id,
    performance_id
  }
  const queries = [
    Connection.updateByAWSID(event.requestContext.connectionId, conParams),
    AuidenceAttendee.create({ audience_id, attendee_id: attendee.id }),
    // TODO we'll have to change getBySource to recieve an array once we incorporate display
    Connection.getBySource(['control', 'display'], performance_id)
  ]
  const [currentConn, audAttend, otherSources] = await Promise.all(queries)

  const payload: IMessagePayload = {
    action: 'performance-joined',
    params: { attendee, audAttend, currentConn, source: "crowd" }
  }

  const messages = [
    messager.sendToSender({ event, payload }, sockets),
  ]

  if (otherSources[0]) {
    const ids = otherSources.map(s => s.aws_connection_id)
    messages.push(messager.sendToIds({ event, payload, ids }, sockets))
  }

  await Promise.all(messages)
}

async function displayJoin(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  const { performance_id } = body.params
  const currentConn = await Connection.updateByAWSID(event.requestContext.connectionId, { performance_id })
  const control = await Connection.getBySource(['control'], performance_id)
  const payload: IMessagePayload = {
    action: 'performance-joined',
    params: { currentConn, source: 'display' }
  }
  const messages = [messager.sendToSender({ event, payload }, sockets)]

  if (control[0]) {
    messages.push(messager.sendToIds({ event, payload, ids: [control[0].aws_connection_id] }, sockets))
  }


  await Promise.all(messages)
}