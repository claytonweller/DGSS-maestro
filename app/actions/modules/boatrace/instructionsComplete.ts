import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Connection } from '../../../../db';

export async function boatraceInstructionsComplete(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params.currentModule.instance;
  const payload: IMessagePayload = {
    action: 'boatrace-instructions-completed',
    params: {},
  };
  const connections = await Connection.getBySource(['display', 'control'], performance_id);
  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
