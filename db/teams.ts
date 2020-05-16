import { crudify } from './index';
import { db } from './index';
import { Interaction } from './interactions';
const TABLE_NAME = 'teams';
const crud = crudify(TABLE_NAME);
export const Team = {
  ...crud,
  createMany,
  join,
};

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

  const interactionParams = {
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

async function createMany(teamCount: number, module_instance_id: number, module_id: number) {
  const teams: ICreateTeamParams[] = [];
  for (let i = 0; i < teamCount; i++) {
    teams.push({
      attendee_aws_ids: [],
      module_instance_id,
      module_id,
      name: `${i + 1}`,
    });
  }

  const boatQueries = teams.map((team) => crud.create(team));
  return await Promise.all(boatQueries);
}

export interface ICreateTeamParams {
  attendee_aws_ids: string[];
  module_instance_id: number;
  module_id: number;
  name: string;
}
