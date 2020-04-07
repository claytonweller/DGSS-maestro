import * as AWS from 'aws-sdk'
import * as util from 'util'

export const sendMessageToClient = (event, connectionId, payload) => {
  const { domainName, stage } = event.requestContext;
  const callbackUrlForAWS = util.format(util.format('https://%s/%s', domainName, stage));

  return new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: callbackUrlForAWS,
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