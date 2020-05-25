import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, Team } from '../../../../db';
import { ICreateManyTeamsParams } from '../../../../db/teams';

export async function boatraceCreateBoatsAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, currentModule } = body.params;

  const teamParams: ICreateManyTeamsParams = {
    teamCount: body.params.boatCount,
    module_instance_id: currentModule.instance.id,
    module_id: currentModule.module.id,
    initialState: { nameIsVisible: false },
  };

  const [connections, boats] = await Promise.all([Connection.getAll(performance_id), Team.createMany(teamParams)]);
  const payload: IMessagePayload = {
    action: 'boatrace-ready-to-board',
    params: { boats },
  };
  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
