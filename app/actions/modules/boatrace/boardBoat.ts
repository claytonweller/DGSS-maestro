import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, Team } from '../../../../db';

export async function boatraceBoardBoatAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, module_instance_id } = body.params;
  const { boatId } = JSON.parse(body.params.data);

  const [connections, boat] = await Promise.all([
    Connection.getBySource(['control', 'display'], performance_id),
    Team.join(module_instance_id, event.requestContext.connectionId, boatId, body.params),
  ]);
  // Can't be async because the team join has to happen first
  const allBoats = await Team.getByParam({ module_instance_id });

  const payload: IMessagePayload = {
    action: 'boatrace-boat-boarded',
    params: { boat },
  };

  const ids = connections.map((c) => c.aws_connection_id);
  await Promise.all([
    messager.sendToSender({ event, payload }, sockets),
    messager.sendToIds({ ids, event, payload: { ...payload, params: { allBoats, boat } } }, sockets),
  ]);
}
