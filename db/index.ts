import { Pool } from 'pg'
import { POSTGRES_URL } from '../config'
export const db = new Pool({
  connectionString: POSTGRES_URL
});

export const dbConnection = async () => {
  await db.connect()
  console.warn('Connected to DB: ' + db.options.connectionString)
}