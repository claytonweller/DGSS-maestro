import { DateTime } from 'luxon';
import { db } from './';

async function getByParam(table: string, params: any, limit?: number) {
  const arr: string[] = [`SELECT * FROM ${table} WHERE removed_at is null`];
  const values: string[] = [];
  if (Object.keys(params).length) {
    Object.keys(params).forEach((k, i) => {
      values.push(params[k]);
      arr.push(`AND ${k} = $${i + 1}`);
    });
  }
  if (limit) arr.push(`LIMIT ${limit}`);

  const query = arr.join(' ');
  const res = await db.query(query, values);
  console.log('Get from ', table);
  return res.rows;
}

async function create(table: string, params: any) {
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
  const query = `
    INSERT INTO ${table} ( ${columns.join(', ')} )
    VALUES ( ${temp.join(', ')} )
    RETURNING *;
  `;
  const res = await db.query(query, values);
  console.log('Create in ', table);
  return res.rows[0];
}

async function update(table: string, id: number | string, params: any) {
  const pairs: string[] = [];
  const values: any[] = [];
  Object.keys(params).forEach((k, i) => {
    pairs.push(`${k} = $${i + 1}`);
    values.push(params[k]);
  });
  const formatedId = typeof id === 'string' ? `'${id}'` : id;
  const query = `
    UPDATE ${table}
    SET ${pairs.join(', ')}
    WHERE id = ${formatedId}
    RETURNING *;
  `;
  const res = await db.query(query, values);
  console.log('Update in ', table);
  return res.rows[0];
}

async function remove(table: string, id: number | string, style: string = '') {
  if (style === 'hard') {
    const query = `
      DELETE FROM ${table}
      WHERE id = $1
    `;
    console.log('HARD delete from ', table);
    return await db.query(query, [id]);
  }
  console.log('Soft delete from ', table);
  return await update(table, id, { removed_at: DateTime.local().toISO() });
}

export function crudify(tableName: string) {
  return {
    async getByParam(params: any = {}, limit?: number) {
      return await crud.getByParam(tableName, params, limit);
    },
    async create(params: any = {}) {
      return await crud.create(tableName, params);
    },
    async update(id: string | number, params: any) {
      return await crud.update(tableName, id, params);
    },
    async remove(id: string | number, style = '') {
      return await crud.remove(tableName, id, style);
    },
  };
}

export const crud = {
  getByParam,
  create,
  update,
  remove,
};
