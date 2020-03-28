import { db } from "./index";

export async function getAll(limit = 10) {
  const query = `
    SELECT * FROM current_connections
    LIMIT ${limit}
  `
  return await db.query(query)
}

export async function create(params: ICreateParams) {
  const query = `
    INSERT INTO current_connections (
      performance_id,
      attendee_id,
      aws_connection_id,
      source
    )
    VALUES ( $1, $2, $3, $4 )
    RETURNING id
  `
  const qParams = [
    params.performance_id,
    params.attendee_id,
    params.aws_connection_id,
    params.source
  ]
  return await db.query(query, qParams)
}

export async function removeByConnectionId(id) {
  const query = `
    DELETE FROM current_connections
    WHERE aws_connection_id = $1
  `
  return await db.query(query, [id])
}


export const Connection = {
  getAll,
  create,
  removeByConnectionId,
}

interface ICreateParams {
  performance_id: number
  attendee_id: number
  aws_connection_id: string
  source: string
}