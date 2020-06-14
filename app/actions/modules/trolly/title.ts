import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { ModuleInstance } from '../../../../db';

export async function trollyTitleAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, id: moduleInstanceId } = body.params.currentModule.instance;

  const payload: IMessagePayload = {
    action: 'trolly-show-title',
    params: {},
  };

  await Promise.all([
    await ModuleInstance.update(moduleInstanceId, { state: JSON.stringify({ pastQuestions: [] }) }),
    await messager.sendToAll({ performance_id, event, payload }, sockets),
  ]);
}
