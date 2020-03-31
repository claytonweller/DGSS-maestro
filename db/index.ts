import { Pool } from 'pg'
import { POSTGRES_URL } from '../config'
import { DateTime } from "luxon";

export const db = new Pool({
  connectionString: POSTGRES_URL
});

export const dbConnection = async () => {
  await db.connect()
  console.warn('Connected to DB: ' + db.options.connectionString)
}

async function getByParam(table: string, params: any, limit: number = 10) {
  const arr: string[] = [`SELECT * FROM ${table} WHERE removed_at is null`]
  const values: string[] = []
  if (params) {
    Object.keys(params).forEach((k, i) => {
      values.push(params[k])
      arr.push(`AND ${k} = $${i + 1}`)
    })
  }
  arr.push(`LIMIT ${limit}`)
  const query = arr.join(' ')
  console.log(query)
  const res = await db.query(query, values)
  return res.rows
}

async function create(table, params) {
  const columns: string[] = []
  const temp: string[] = []
  const values: any[] = []
  Object.keys(params).forEach((k, i) => {
    columns.push(k)
    temp.push(`$${i + 1}`)
    values.push(params[k])
  })

  const query = `
    INSERT INTO ${table} ( ${columns.join(', ')} )
    VALUES ( ${temp.join(', ')} )
    RETURNING *;
  `
  const res = await db.query(query, values)
  return res.rows[0]
}

async function update(table, id, params) {
  const pairs: string[] = []
  const values: any[] = []
  Object.keys(params).forEach((k, i) => {
    pairs.push(`${k} = $${i + 1}`)
    values.push(params[k])
  })

  const query = `
    UPDATE ${table}
    SET ${pairs.join(', ')}
    WHERE id = ${id}
    RETURNING *;
  `
  const res = await db.query(query, values)
  return res.rows[0]
}

async function remove(table, id, style = '') {
  if (style === 'hard') {
    const query = `
      DELETE FROM ${table}
      WHERE id = ${id}
    `
    return await db.query(query)
  }

  return await update(table, id, { removed_at: DateTime.local().toISO() })
}

export function crudify(tableName) {
  return {
    async getByParam(params: any, limit: number = 10) {
      return await crud.getByParam(tableName, params, limit)
    },
    async create(params) {
      return await crud.create(tableName, params)
    },
    async update(id, params) {
      return await crud.update(tableName, id, params)
    },
    async remove(id, style = '') {
      return await crud.remove(tableName, id, style)
    }
  }
}

export const crud = {
  getByParam,
  create,
  update,
  remove
}