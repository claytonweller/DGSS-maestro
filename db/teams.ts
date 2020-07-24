import { crudify } from './index';
import { db } from './index';
import { Interaction, IInteractionParams } from './interactions';
const TABLE_NAME = 'teams';
const crud = crudify(TABLE_NAME);
export const Team = {
  ...crud,
  createMany,
  join,
};

export interface ITeam {
  id: number;
  state: any;
  name: string;
  progress: number;
  module_instance_id: number;
  created_at: string;
  removed_at: string;
  module_id: number;
  attendee_aws_ids: string[];
  captain_aws_id: string;
  captain_name: string;
}

async function join(module_instance_id, attendee_aws_id, team_id, messageParams) {
  const leaveOtherTeams = `
    UPDATE teams
    SET attendee_aws_ids = array_remove( attendee_aws_ids, $1 )
    WHERE module_instance_id = $2;
  `;
  const joinNewTeam = `  
    UPDATE teams
    SET attendee_aws_ids = array_append( attendee_aws_ids, $1 )
    WHERE id = $2
    RETURNING *;
  `;

  const interactionParams: IInteractionParams = {
    ...messageParams,
    response: team_id,
    prompt: 'Joined team',
  };

  await Promise.all([
    db.query(leaveOtherTeams, [attendee_aws_id, module_instance_id]),
    Interaction.create(interactionParams),
  ]);
  const res = await db.query(joinNewTeam, [attendee_aws_id, team_id]);
  return res.rows[0];
}

async function createMany({ teamCount, module_instance_id, module_id, initialState }: ICreateManyTeamsParams) {
  const teams: ICreateTeamParams[] = [];
  for (let i = 0; i < teamCount; i++) {
    teams.push({
      attendee_aws_ids: [],
      module_instance_id,
      module_id,
      name: `${i + 1}`,
      state: initialState ? JSON.stringify(initialState) : undefined,
    });
  }

  const teamQueries = teams.map((team) => crud.create(team));
  return await Promise.all(teamQueries);
}

export interface ICreateManyTeamsParams {
  teamCount: number;
  module_instance_id: number;
  module_id: number;
  initialState?: {};
}

export interface ICreateTeamParams {
  attendee_aws_ids: string[];
  module_instance_id: number;
  module_id: number;
  name: string;
  state?: string;
}
