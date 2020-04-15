import { crudify } from "./index";

// This is a join table for Audiences and Attendees many to many relation

const TABLE_NAME = 'audience_attendees_j'

export const AuidenceAttendee = crudify(TABLE_NAME) 