import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttTeamsAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'ttt-teams-created',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
