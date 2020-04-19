import { DateTime } from "luxon";
import { Performance } from "../../../db"
import { IActionElements } from "../";

export async function endPerformanceAction(actionElements: IActionElements) {
  const { event, body, messager, sockets } = actionElements
  await Performance.update(body.params.id, { ended_at: DateTime.local().toISO() })
  const payload = {
    action: 'performance-ended',
    params: {}
  }
  await messager.sendToAll({ event, payload }, sockets)
}