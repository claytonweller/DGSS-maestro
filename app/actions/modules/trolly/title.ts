import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function trollyTitleAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params.currentModule.instance;

  const payload: IMessagePayload = {
    action: 'trolly-show-title',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
