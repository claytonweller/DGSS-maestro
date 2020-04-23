import { crudify, db } from "./index";

const TABLE_NAME = 'module_instances'

async function getWithModule(title, performance_id) {
  const query = `
    SELECT * FROM modules m
    INNER JOIN module_instances i ON m.id = i.module_id
    WHERE i.performance_id = $1
    AND m.title = $2
  `
  const res = await db.query(query, [performance_id, title])
  return res.rows[0]
}

export const ModuleInstance = {
  getWithModule,
  ...crudify(TABLE_NAME)
} 