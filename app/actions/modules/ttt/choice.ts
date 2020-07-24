import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttChoiceAction({ body, event, messager, sockets }: IActionElements) {
  const payload: IMessagePayload = {
    action: 'ttt-choice-made',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
