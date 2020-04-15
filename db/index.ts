import { Pool } from 'pg'
import { POSTGRES_URL } from '../config'
import { crudify } from './crud'
import { Attendee } from "./attendees";
import { AuidenceAttendee } from "./audience_attendees_j";
import { Audience } from "./audiences";
import { Interaction } from "./interactions";
import { Module } from "./module";
import { ModuleInstance } from "./module_instances";
import { Performance } from "./performances";
import { Connection } from "./connections";

export { crudify }
export { Attendee, AuidenceAttendee, Audience, Connection, Interaction, Module, ModuleInstance, Performance }
export const db = new Pool({
  connectionString: POSTGRES_URL
});

export const dbConnection = async () => {
  await db.connect()
  console.warn('Connected to DB: ' + db.options.connectionString)
}