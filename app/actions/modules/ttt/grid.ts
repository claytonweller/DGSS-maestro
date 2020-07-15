import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttGridAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'ttt-show-grid',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
