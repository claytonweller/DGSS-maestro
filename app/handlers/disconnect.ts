import { db } from '../../db';
import { Connection } from '../../db/connections';

export const handler = async (event) => {
  await db.connect();
  console.warn('Connected to DB: ' + db.options.connectionString);
  console.warn(event);
  try {
    console.warn('REMOVEAL ID', event.requestContext.connectionId);
    await Connection.removeByConnectionId(event.requestContext.connectionId);
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: e,
    };
  }

  await db.end();
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Successful Disconnect',
        input: event,
      },
      null,
      2
    ),
  };
};
