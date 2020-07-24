import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function tttEndGameAction({ body, event, messager, sockets }: IActionElements) {
  const payload: IMessagePayload = {
    action: 'ttt-game-ended',
    params: { currentQuestion: body },
  };

  await messager.sendToSender({ event, payload }, sockets);
}
