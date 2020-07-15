import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttTitleAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'ttt-Title-grid',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
