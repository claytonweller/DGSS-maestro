import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, Team } from '../../../../db';

export async function boatraceBoardBoatAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, module_instance_id } = body.params;
  const { boatId } = JSON.parse(body.params.data);

  const [connections, boat] = await Promise.all([
    Connection.getAll(performance_id),
    Team.join(module_instance_id, event.requestContext.connectionId, boatId, body.params),
  ]);

  const payload: IMessagePayload = {
    action: 'boatrace-boat-boarded',
    params: { boat },
  };

  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
