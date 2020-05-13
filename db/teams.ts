import { crudify } from './index';

const TABLE_NAME = 'teams';

export const Team = crudify(TABLE_NAME);
