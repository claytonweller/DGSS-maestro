import * as AWS from 'aws-sdk'
import * as util from 'util'

export const connectionHandler = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    )
  };
};

const sendMessageToClient = (url, connectionId, payload) =>
  new Promise((resolve, reject) => {
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

export const defaultHandler = async event => {
  const { domainName, stage } = event.requestContext;
  const { connectionId } = event.requestContext;
  const callbackUrlForAWS = util.format(util.format('https://%s/%s', domainName, stage)); //construct the needed url
  await sendMessageToClient(callbackUrlForAWS, connectionId, event);

  return {
    statusCode: 200,
  };
}