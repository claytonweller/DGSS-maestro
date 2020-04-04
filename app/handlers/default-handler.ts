import * as AWS from 'aws-sdk'
import * as util from 'util'
import { dbConnection } from '../../db'
import { Connection } from "../../db/connections";

export const defaultHandler = async event => {
  await dbConnection()
  const { domainName, stage } = event.requestContext;
  const connections = await Connection.getAll()
  console.warn(connections)
  const messages = connections.rows.map(con => {
    const callbackUrlForAWS = util.format(util.format('https://%s/%s', domainName, stage));
    return sendMessageToClient(callbackUrlForAWS, con.aws_connection_id, event);
  });

  await Promise.all(messages)

  return {
    statusCode: 200,
  };
}

const sendMessageToClient = (url, connectionId, payload) => {
  return new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: url,
    });
    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId, // connectionId of the receiving ws-client
        Data: JSON.stringify(payload),
      },
      (err, data) => {
        if (err && err.statusCode !== 410) {
          console.log('err is', err);
          reject(err);
        } else {
          resolve('This is an expired connection')
        }
        resolve(data);
      }
    );
  });
}