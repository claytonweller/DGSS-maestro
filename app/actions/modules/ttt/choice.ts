import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttChoiceAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'ttt-choice-made',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
