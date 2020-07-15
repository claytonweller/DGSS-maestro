import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttNextRoundAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'ttt-next-round-results',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
