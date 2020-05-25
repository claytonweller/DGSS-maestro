import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Connection, Team } from '../../../../db';

export async function boatraceRevealBoatName(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params.currentModule.instance;
  const { revealedBoat } = body.params;
  const [connections, boat] = await Promise.all([
    Connection.getBySource(['control', 'display'], performance_id),
    Team.update(revealedBoat.id, { name: revealedBoat.name, state: JSON.stringify({ nameIsVisible: true }) }),
  ]);

  const payload: IMessagePayload = {
    action: 'boatrace-display-boat-name',
    params: { boat },
  };

  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
