import { Connection } from "../../db/connections"
import { sendMessageToClient } from '../actions/sendMessage';

export const manageEvent = async event => {
  console.log('BODY', event.body)
  const message = JSON.parse(event.body)
  if (message.action === 'connect-source') {
    const { params } = message
    const awsId = event.requestContext.connectionId
    const updatedParams = {
      source: params.source
    }
    const currentConnection = await Connection.updateByAWSID(awsId, updatedParams)
    await sendMessageToClient(event, awsId, { action: 'conn-update', currentConnection })
  }
}