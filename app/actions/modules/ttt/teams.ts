import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, Team, ModuleInstance } from '../../../../db';
import { ITeam } from '../../../../db/teams';
import { IConnection } from '../../../../db/connections';

export async function tttTeamsAction({ body, event, messager, sockets }: IActionElements) {
  const { performance_id, id, module_id } = body.params.currentModule.instance;

  const connections: IConnection[] = await Connection.getAll(performance_id);

  const { teamAwsIds, teamX, teamO } = await createTeams(connections, id, module_id);

  const moduleInstance = await ModuleInstance.update(id, { state: { teamX, teamO } });
  const nonCrowdIds = connections.filter((c) => c.source !== 'crowd').map((c) => c.aws_connection_id);

  await Promise.all([
    messager.sendToIds({ event, payload: createPayload(teamX), ids: teamAwsIds.X }, sockets),
    messager.sendToIds({ event, payload: createPayload(teamO), ids: teamAwsIds.O }, sockets),
    messager.sendToIds({ event, payload: createPayload(moduleInstance), ids: nonCrowdIds }, sockets),
  ]);
}

async function createTeams(
  connections,
  module_instance_id,
  module_id
): Promise<{ teamAwsIds: ITeamAwsIds; teamX: ITeam; teamO: ITeam }> {
  const crowdConnections: IConnection[] = connections.filter((c) => c.source === 'crowd');
  const teamAwsIds = splitCrowdIntoTeams(crowdConnections);
  const sharedTeamParams = { state: { score: 0 }, module_instance_id, module_id };
  const [teamX, teamO] = await Promise.all([
    Team.create({ attendee_aws_ids: teamAwsIds.X, name: 'X', ...sharedTeamParams }),
    Team.create({ attendee_aws_ids: teamAwsIds.O, name: 'O', ...sharedTeamParams }),
  ]);

  return { teamAwsIds, teamX, teamO };
}

function createPayload(params): IMessagePayload {
  return {
    action: 'ttt-teams-created',
    params: params,
  };
}

function splitCrowdIntoTeams(crowdConnections: IConnection[]): ITeamAwsIds {
  const teams: { X: string[]; O: string[] } = { X: [], O: [] };
  return crowdConnections.reduce((teams, conn, i) => {
    if (i % 2) {
      teams.X.push(conn.aws_connection_id);
    } else {
      teams.O.push(conn.aws_connection_id);
    }
    return teams;
  }, teams);
}

interface ITeamAwsIds {
  X: string[];
  O: string[];
}
