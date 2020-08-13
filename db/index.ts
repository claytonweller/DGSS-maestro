import { Pool } from 'pg';
import { POSTGRES_URL } from '../config';
import { crudify } from './crud';
import { Attendee } from './attendees';
import { AuidenceAttendee } from './audience_attendees_j';
import { Audience } from './audiences';
import { Interaction } from './interactions';
import { Module } from './module';
import { ModuleInstance } from './module_instances';
import { Performance } from './performances';
import { Connection } from './connections';
import { Team } from './teams';

export { crudify };
export { Attendee, AuidenceAttendee, Audience, Connection, Interaction, Module, ModuleInstance, Performance, Team };
export const db = new Pool({
  connectionString: POSTGRES_URL,
});

// const clientConnector = (query: (client: Client) => any): (() => any) => {
//   const connectedQuery = async () => {
//     const client = await db.connect();
//     const result = await query(client);
//     client.release();
//     return result;
//   };

//   return connectedQuery;
// };

export const makeQuery = async (query, params) => {
  const client = await db.connect();
  const result = await client.query(query, params);
  client.release();
  return result;
};
