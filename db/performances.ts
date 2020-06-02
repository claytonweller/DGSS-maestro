import { crudify } from './index';
import { db } from './';
import { DateTime } from 'luxon';
const TABLE_NAME = 'performances';

async function getActive() {
  console.log('Get Active Performances');
  const query = `
    SELECT * FROM performances
    WHERE ended_at is null
    AND created_at > $1
  `;
  const res = await db.query(query, [DateTime.local().minus({ hours: 4 }).toISO()]);
  return res.rows;
}

export const Performance = {
  getActive,
  ...crudify(TABLE_NAME),
};
