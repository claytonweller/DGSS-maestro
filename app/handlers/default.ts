import { db } from '../../db';
import { manageEvent } from '../actions';
import { AWSMessager } from '../actions/messager';

export const handler = async (event) => {
  await db.connect();
  console.warn('Connected to DB: ' + db.options.connectionString);
  await manageEvent(event, AWSMessager);
  await db.end();
  return {
    statusCode: 200,
  };
};
