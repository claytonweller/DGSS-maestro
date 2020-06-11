import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function trollyEndMadnessAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;

  // Get all connections
  // Should update the moduleInstance to be in a finished state
  // Should message everyone

  const payload: IMessagePayload = {
    action: 'trolly-madness-over',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
