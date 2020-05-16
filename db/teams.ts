import { crudify } from './index';

const TABLE_NAME = 'teams';
const crud = crudify(TABLE_NAME);
export const Team = {
  ...crud,
  createMany,
};

async function createMany(teamCount: number, module_instance_id: number, module_id: number) {
  const boats: ICreateTeamParams[] = [];
  for (let i = 0; i < teamCount; i++) {
    boats.push({
      attendee_aws_ids: [],
      module_instance_id,
      module_id,
    });
  }

  const boatQueries = boats.map((boat) => crud.create(boat));
  return await Promise.all(boatQueries);
}

export interface ICreateTeamParams {
  attendee_aws_ids: string[];
  module_instance_id: number;
  module_id: number;
}
