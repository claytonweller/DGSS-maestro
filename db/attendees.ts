import { db } from "./index";
import { DateTime } from "luxon";

async function getByParam(params: any, limit: number = 10) {
  const arr: string[] = ['SELECT * FROM attendees WHERE removed_at is null']
  const values: string[] = []
  if (params) {
    Object.keys(params).forEach((k, i) => {
      values.push(params[k])
      arr.push(`AND ${k} = $${i + 1}`)
    })
  }
  arr.push(`LIMIT ${limit}`)
  const query = arr.join(' ')
  const res = await db.query(query, values)
  return res.rows
}

async function create(params) {
  const columns: string[] = []
  const temp: string[] = []
  const values: any[] = []
  Object.keys(params).forEach((k, i) => {
    columns.push(k)
    temp.push(`$${i + 1}`)
    values.push(params[k])
  })

  const query = `
    INSERT INTO attendees ( ${columns.join(', ')} )
    VALUES ( ${temp.join(', ')} )
    RETURNING *;
  `
  const res = await db.query(query, values)
  return res.rows[0]
}

async function update(id, params) {
  const pairs: string[] = []
  const values: any[] = []
  Object.keys(params).forEach((k, i) => {
    pairs.push(`${k} = $${i + 1}`)
    values.push(params[k])
  })

  const query = `
    UPDATE attendees
    SET ${pairs.join(', ')}
    WHERE id = ${id}
    RETURNING *;
  `
  const res = await db.query(query, values)
  return res.rows[0]
}

async function remove(id, style = '') {
  if (style === 'hard') {
    const query = `
      DELETE FROM attendees
      WHERE id = ${id}
    `
    return await db.query(query)
  }

  return await update(id, { removed_at: DateTime.local().toISO() })
}

export const Attendees = {
  getByParam,
  create,
  update,
  remove
}