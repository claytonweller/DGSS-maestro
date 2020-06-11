import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function trollyGridAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;
  // gets connections for display & Control
  // Updates the moduleInstance to have no question in state
  // Send messages

  const payload: IMessagePayload = {
    action: 'trolly-show-grid',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
