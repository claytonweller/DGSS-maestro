import * as AWS from 'aws-sdk'
import * as util from 'util'
import { Connection } from '../../db/connections'

export const AWSMessager: IMessager = {
  sendToSender,
  sendToAll,
  sendToIds
}

async function sendToSender({ event, payload }: { event: ILambdaEvent, payload: IMessagePayload }) {
  const gatewayParams: IGateWayParams = {
    event,
    connectionId: event.requestContext.connectionId,
    payload
  }
  await sendMessageToAWSGateway(gatewayParams)
}

async function sendToAll({ event, payload }: { event: ILambdaEvent, payload: IMessagePayload }) {
  const connections = await Connection.getAll()
  const awsIds = connections.map(con => con.aws_connection_id)
  await Promise.all(createMessagesForAws(event, payload, awsIds))
}

async function sendToIds(
  { event, payload, ids }: { event: ILambdaEvent, payload: IMessagePayload, ids: string[] }
) {
  await Promise.all(createMessagesForAws(event, payload, ids))
}

function createMessagesForAws(event: ILambdaEvent, payload: IMessagePayload, ids: string[]) {
  return ids.map(id => {
    const params: IGateWayParams = {
      event,
      connectionId: id,
      payload: payload
    }
    return sendMessageToAWSGateway(params);
  });
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
  sendToSender(
    { event, payload }: { event: ILambdaEvent, payload: IMessagePayload },
    sockets: any
  )
  sendToAll(
    { event, payload }: { event: ILambdaEvent, payload: IMessagePayload },
    sockets: any
  ),
  sendToIds(
    { event, payload, ids }: { event: ILambdaEvent, payload: IMessagePayload, ids: string[] },
    sockets: any
  )
}

interface IGateWayParams {
  event: ILambdaEvent,
  connectionId: string | null,
  payload: IMessagePayload
}

export interface ILambdaEvent {
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

export interface IMessagePayload {
  action: string,
  params: any
}