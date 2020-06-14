import { crudify } from './index';
import { db } from './index';

const TABLE_NAME = 'current_connections';
const crud = crudify(TABLE_NAME);

export interface IConnection {
  id: string;
  performance_id: number;
  attendee_id: number;
  aws_connection_id: string;
  created_at: string;
  source: string;
}

export async function getAll(performance_id?: number): Promise<IConnection[]> {
  let query = 'SELECT * FROM current_connections';
  let params: any[] = [];
  if (performance_id) {
    params.push(performance_id);
    query += ' WHERE performance_id = $1';
  }
  console.log('Get All Connections');
  const conns = await db.query(query, params);
  return conns.rows;
}

export async function getBySource(sources: string[], performance_id = 0, limit = 0): Promise<IConnection[]> {
  let query = `
    SELECT * FROM current_connections
    where source = $1
  `;
  const params: Array<string | number> = [sources[0]];

  if (sources[1]) {
    params.push(sources[1]);
    query += ` OR source = $${params.length}`;
  }

  if (performance_id) {
    params.push(performance_id);
    query += ` AND performance_id = $${params.length}`;
  }

  if (limit) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }
  console.log(`Get ${sources.join(', ')} Connections`);
  const conns = await db.query(query, params);
  return conns.rows;
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
  `;
  const qParams = [params.performance_id, params.attendee_id, params.aws_connection_id, params.source];
  const conn = await db.query(query, qParams);
  return conn.rows[0];
}

export async function removeByConnectionId(id) {
  const query = `
    DELETE FROM current_connections
    WHERE aws_connection_id = $1
  `;
  return await db.query(query, [id]);
}

export async function updateByAWSID(awsId, params): Promise<IConnection> {
  const pairs: string[] = [];
  const values: any[] = [];
  Object.keys(params).forEach((k, i) => {
    pairs.push(`${k} = $${i + 1}`);
    values.push(params[k]);
  });
  const query = `
    UPDATE ${TABLE_NAME}
    SET ${pairs.join(', ')}
    WHERE aws_connection_id = '${awsId}'
    RETURNING *;
  `;
  const res = await db.query(query, values);
  return res.rows[0];
}

export async function removeAllBefore(performanceId = 0): Promise<void> {
  const query = `
    DELETE FROM ${TABLE_NAME}
    WHERE performance_id < $1
  `;
  await db.query(query, [performanceId]);
  console.log('CLEARED ALL CONNECTIONS FROM BEFORE PERFORMANCE: ', performanceId);
}

export const Connection = {
  update: crud.update,
  updateByAWSID,
  getBySource,
  getAll,
  create,
  removeByConnectionId,
  removeAllBefore,
};

interface ICreateParams {
  performance_id: number;
  attendee_id: number | null;
  aws_connection_id: string;
  source: string | null;
}
