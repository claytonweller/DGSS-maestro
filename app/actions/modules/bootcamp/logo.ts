import { IActionElements } from '../../';
import { Connection } from '../../../../db';
import { IMessagePayload } from '../../messager';

export async function bootcampLogoAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;
  const connections = await Connection.getBySource(['display'], performance_id);
  const payload: IMessagePayload = {
    action: 'bootcamp-logo',
    params: {},
  };
  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
