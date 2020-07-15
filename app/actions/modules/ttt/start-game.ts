import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttStartGameAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'ttt-game-started',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
