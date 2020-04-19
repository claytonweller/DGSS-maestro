import { IActionElements } from "../";
import { Connection, Attendee, AuidenceAttendee } from "../../../db"
import { IMessagePayload } from "../messager";

export async function joinPerformanceAction(actionElements: IActionElements) {
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
    Connection.getBySource('control', performance_id)
  ]
  const [currentConn, audAttend, control] = await Promise.all(queries)

  const payload: IMessagePayload = {
    action: 'performance-joined',
    params: { attendee, audAttend, currentConn }
  }
  const messages = [
    messager.sendToSender({ event, payload }, sockets),
    messager.sendToIds({ event, payload, ids: [control[0].aws_connection_id] }, sockets)
  ]

  await Promise.all(messages)
}