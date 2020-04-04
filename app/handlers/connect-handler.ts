import { dbConnection } from '../../db'
import { Connection } from "../../db/connections";

export const connectHandler = async event => {
  await dbConnection()
  console.warn(event)
  const params = {
    performance_id: 1,
    attendee_id: 1,
    aws_connection_id: event.requestContext.connectionId,
    source: 'string'
  }
  await Connection.create(params)
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