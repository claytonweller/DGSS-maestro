import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function boatraceCreateBoatsAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;

  // const [connections, teams] =
  const payload: IMessagePayload = {
    action: 'boatrace-ready-to-board',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
