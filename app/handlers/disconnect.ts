import { Connection } from '../../db/connections';

export const handler = async (event) => {
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
