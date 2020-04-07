import { dbConnection } from '../../db'
import { manageEvent } from '../actions';
// import { Connection } from "../../db/connections";
// import { sendMessageToClient } from '../actions/sendMessage';

export const handler = async event => {
  await dbConnection()

  // const connections = await Connection.getAll()
  // console.warn(connections)
  // const messages = connections.rows.map(con => {
  //   return sendMessageToClient(event, con.aws_connection_id, event);
  // });

  // await Promise.all(messages)
  await manageEvent(event)

  return {
    statusCode: 200,
  };
}

