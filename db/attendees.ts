import { crudify, db } from './index';

const TABLE_NAME = 'attendees';
const crud = crudify(TABLE_NAME);
export const Attendee = {
  ...crud,
  getByPerfomanceId,
  getByAwsConnectionIds,
};

async function getByPerfomanceId(performance_id: number) {
  console.log('Attendees join on Connections');
  const query = `
    SELECT a.*, c.aws_connection_id FROM attendees a
    INNER JOIN current_connections c ON a.id = c.attendee_id
    WHERE c.performance_id = $1
  `;
  const res = await db.query(query, [performance_id]);
  return res.rows;
}

async function getByAwsConnectionIds(aws_connection_ids: string[]) {
  console.log('Attendees join on Connections');

  let query = `
    SELECT a.*, c.aws_connection_id FROM attendees a
    INNER JOIN current_connections c ON a.id = c.attendee_id
    WHERE c.aws_connection_id = $1
  `;

  for (let i = 0; i < aws_connection_ids.length - 1; i++) {
    query += ` OR c.aws_connection_id = $${i + 2}`;
  }
  const res = await db.query(query, aws_connection_ids);
  return res.rows;
}
