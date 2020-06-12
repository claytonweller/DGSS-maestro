import { ILambdaEvent, IMessagePayload, IMessager } from './messager';
import { performanceActionHash } from './performance';
import { testActionHash } from './test';
import { utilActionHash } from './utility';
import { moduleActionHash } from './modules';

// In order to keep the local and prod development separate we send through a specifi 'messager'
// function for each environment that knows how to handle events in its respective context
// The 'sockets' param is only used in local development. Handlers are entirely event driven.
export const manageEvent = async (event: ILambdaEvent, messager: IMessager, sockets = {}) => {
  console.log('BODY', event.body);
  const body = JSON.parse(event.body);
  const action = Object.keys(actionHash).includes(body.action) ? actionHash[body.action] : actionHash.defaultAction;
  const actionElements = {
    body, // This is the information FROM the client
    event, // This is the metadata about the connection to the lambdaHandler (includes body)
    messager, // This is the way we manage websocket connections
    sockets, // This is only used in the local case
  };

  try {
    await action(actionElements);
  } catch (e) {
    console.error(e);
  }
};

const actionHash = {
  defaultAction,
  ...utilActionHash,
  ...testActionHash,
  ...performanceActionHash,
  ...moduleActionHash,
};

async function defaultAction(actionElements: IActionElements) {
  console.log(actionElements);
}

export interface IActionElements {
  event: ILambdaEvent;
  body: IMessagePayload;
  messager: IMessager;
  sockets: any;
}
