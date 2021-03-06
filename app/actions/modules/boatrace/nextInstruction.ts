import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Connection } from '../../../../db';

export async function boatraceNextInstruction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params.currentModule.instance;
  const payload: IMessagePayload = {
    action: 'boatrace-display-next-instruction',
    params: {},
  };
  const connections = await Connection.getBySource(['display'], performance_id);
  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
