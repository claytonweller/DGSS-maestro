import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, Team } from '../../../../db';

export async function boatraceCreateBoatsAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, currentModule } = body.params;

  const [connections, boats] = await Promise.all([
    Connection.getAll(performance_id),
    Team.createMany(body.params.boatCount, currentModule.instance.id, currentModule.module.id),
  ]);
  const payload: IMessagePayload = {
    action: 'boatrace-ready-to-board',
    params: { boats },
  };
  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
