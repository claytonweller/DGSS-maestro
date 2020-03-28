import * as AWS from 'aws-sdk'
import * as util from 'util'
import { dbConnection } from '../db'
import { Connection } from "../db/connections";

export const connectHandler = async event => {
  await dbConnection()
  console.warn(event)
  const params = {
    performance_id: 1,
    attendee_id: 1,
    aws_connection_id: event.requestContext.connectionId,
    source: 'string'
  }
  Connection.create(params)
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

export const disconnectHandler = async event => {
  await dbConnection()
  console.warn(event)
  try {
    console.warn('REMOVEAL ID', event.requestContext.connectionId)
    await Connection.removeByConnectionId(event.requestContext.connectionId)

  } catch (e) {
    console.error(e)
    return {
      statusCode: 500,
      body: e
    }
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
    )
  }
}

export const defaultHandler = async event => {
  const { domainName, stage, connectionId } = event.requestContext;
  const callbackUrlForAWS = util.format(util.format('https://%s/%s', domainName, stage)); //construct the needed url
  await sendMessageToClient(callbackUrlForAWS, connectionId, event);

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
        if (err) {
          console.log('err is', err);
          reject(err);
        }
        resolve(data);
      }
    );
  });
}
