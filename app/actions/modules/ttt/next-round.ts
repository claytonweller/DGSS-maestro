import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttNextRoundAction({ body, event, messager, sockets }: IActionElements) {
  const payload: IMessagePayload = {
    action: 'ttt-next-round-results',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
