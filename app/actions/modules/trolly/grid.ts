import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, ModuleInstance } from '../../../../db';

export async function trollyGridAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, currentModule } = body.params;

  const [connections, moduleInstances] = await Promise.all([
    Connection.getBySource(['display', 'control'], performance_id),
    ModuleInstance.getByParam({ id: currentModule.instance.id }),
  ]);

  const newState = { ...moduleInstances[0].state, currentQuestion: {} };

  const payload: IMessagePayload = {
    action: 'trolly-show-grid',
    params: { ...newState },
  };

  const ids = connections.map((c) => c.aws_connection_id);

  await messager.sendToIds({ event, ids, payload }, sockets);
}
