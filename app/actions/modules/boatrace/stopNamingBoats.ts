import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function boatraceStopNamingBoats(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;
  const payload: IMessagePayload = {
    action: 'boatrace-no-more-naming',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
