import { crudify } from "./index";
import { db } from "./index";

const TABLE_NAME = 'current_connections'
const crud = crudify(TABLE_NAME)

export interface IConnection {
  id: string
  perfomance_id: number
  attendee_id: number
  aws_connection_id: string
  created_at: string
  source: string
}

export async function getAll(limit = 10): Promise<IConnection[]> {
  const query = `
    SELECT * FROM current_connections
    LIMIT ${limit}
  `
  const conns = await db.query(query)
  return conns.rows
}

export async function create(params: ICreateParams): Promise<IConnection> {
  const query = `
    INSERT INTO current_connections (
      performance_id,
      attendee_id,
      aws_connection_id,
      source
    )
    VALUES ( $1, $2, $3, $4 )
    RETURNING *
  `
  const qParams = [
    params.performance_id,
    params.attendee_id,
    params.aws_connection_id,
    params.source
  ]
  const conn = await db.query(query, qParams)
  return conn.rows[0]
}

export async function removeByConnectionId(id) {
  const query = `
    DELETE FROM current_connections
    WHERE aws_connection_id = $1
  `
  return await db.query(query, [id])
}

export async function updateByAWSID(awsId, params): Promise<IConnection> {
  const pairs: string[] = []
  const values: any[] = []
  Object.keys(params).forEach((k, i) => {
    pairs.push(`${k} = $${i + 1}`)
    values.push(params[k])
  })
  const query = `
    UPDATE ${TABLE_NAME}
    SET ${pairs.join(', ')}
    WHERE aws_connection_id = '${awsId}'
    RETURNING *;
  `
  const res = await db.query(query, values)
  return res.rows[0]
}

export const Connection = {
  update: crud.update,
  updateByAWSID,
  getAll,
  create,
  removeByConnectionId,
}

interface ICreateParams {
  performance_id: number
  attendee_id: number | null
  aws_connection_id: string
  source: string | null
}