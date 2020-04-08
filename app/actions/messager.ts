import * as AWS from 'aws-sdk'
import * as util from 'util'
import { Connection } from '../../db/connections'

export const AWSMessager: IMessager = {
  sendToSender,
  sendToAll
}

async function sendToSender(params: IGateWayParams) {
  await sendMessageToAWSGateway(params)
}

async function sendToAll({ event, payload }: { event: ILambdaEvent, payload: IMessagePayload }) {
  const connections = await Connection.getAll()
  const messages = connections.rows.map(con => {
    const params: IGateWayParams = {
      event,
      connectionId: con.aws_connection_id,
      payload: payload
    }
    return sendMessageToAWSGateway(params);
  });
  await Promise.all(messages)
}

const sendMessageToAWSGateway = ({ event, connectionId, payload }: IGateWayParams) => {
  const { domainName, stage } = event.requestContext;
  const callbackUrlForAWS = util.format(util.format('https://%s/%s', domainName, stage));

  return new Promise((resolve, reject) => {
    const apigatewaymanagementapi = new AWS.ApiGatewayManagementApi({
      apiVersion: '2018-11-29',
      endpoint: callbackUrlForAWS,
    });
    apigatewaymanagementapi.postToConnection(
      {
        ConnectionId: connectionId as string, // connectionId of the receiving ws-client
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

export interface IMessager {
  sendToSender(IGateWayParams, sockets: any),
  sendToAll({ event: ILambdaEvent, payload: IMessagePayload }, sockets: any)
}

interface IGateWayParams {
  event: ILambdaEvent,
  connectionId: string | null,
  payload: IMessagePayload
}

interface ILambdaEvent {
  requestContext: {
    routeKey: string
    messageId: string
    eventType: string
    extendedRequestId: string
    requestTime: string
    messageDirection: string
    stage: string
    connectedAt: number
    requestTimeEpoch: number
    requestId: string
    domainName: string
    connectionId: string
    apiId: string
  },
  body: any,
  isBase64Encoded: boolean
}

interface IMessagePayload {
  action: string,
  params: any
}