import { crudify } from "./index";
import { db } from "./";
import { DateTime } from 'luxon'
const TABLE_NAME = 'performances'

async function getActive() {
  const query = `
    SELECT * FROM performances
    WHERE ended_at is null
    AND created_at > $1
  `
  console.log(query)
  const res = await db.query(query, [DateTime.local().minus({ days: 1 }).toISO()])
  return res.rows
}

export const Performance = {
  getActive,
  ...crudify(TABLE_NAME)
}