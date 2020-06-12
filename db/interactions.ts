import { crudify } from './index';
import { db } from '.';

const TABLE_NAME = 'interactions';

export const Interaction = {
  ...crudify(TABLE_NAME),
  createMany,
};

async function createMany(attendeeIds: number[], params: any = {}) {
  const columns: string[] = [];
  const temp: string[] = [];
  const values: any[] = [];
  if (Object.keys(params).length) {
    Object.keys(params).forEach((k, i) => {
      columns.push(k);
      temp.push(`$${i + 1}`);
      values.push(params[k]);
    });
  }

  const rows = attendeeIds.map((id) => {
    return `( ${id}, ${temp.join(', ')} )`;
  });
  const query = `
    INSERT INTO ${TABLE_NAME} ( attendee_id, ${columns.join(', ')} )
    VALUES ${rows.join(', ')}
    RETURNING *;
  `;

  console.warn(query);
  const res = await db.query(query, values);
  console.log('Create Many in ', TABLE_NAME);
  return res.rows;
}

export interface IInteractionParams {
  module_instance_id: number;
  attendee_id: number;
  attendee_name: string;
  performance_id: number;
  audience_id: number;
  module_id: number;
  data: string;
  response: string;
  prompt: string;
}
