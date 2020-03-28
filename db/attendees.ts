import { db } from "./index";

export async function getAllAttendees(limit = 10) {
  const query = `
    SELECT * FROM attendees
    LIMIT ${limit}
  `
  return await db.query(query)
}