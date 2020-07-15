import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttEndGameAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'ttt-game-ended',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
