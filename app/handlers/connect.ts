import { dbConnection } from '../../db'
import { Connection } from "../../db/connections";

export const handler = async event => {
  await dbConnection()
  const aws_connection_id = event.requestContext.connectionId
  const params = {
    performance_id: 1,
    attendee_id: 1,
    aws_connection_id,
    source: 'string'
  }
  await Connection.create(params)
  // This removes all the test connections so they don't gum up the works

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Successful Connect',
        input: event,
      },
      null,
      2
    )
  };
};