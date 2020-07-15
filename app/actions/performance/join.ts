import { IActionElements } from '../';
import { Connection, Attendee, AuidenceAttendee, ModuleInstance } from '../../../db';
import { IMessagePayload } from '../messager';

export async function joinPerformanceAction(actionElements: IActionElements) {
  const { body, event, sockets, messager } = actionElements;
  const { source } = body.params;
  try {
    if (source === 'crowd') {
      await attendeeJoin(actionElements);
    } else if (source === 'display') {
      await displayJoin(actionElements);
    } else if (source === 'control') {
      await controlJoin(actionElements);
    }

    throw new Error('Not a correct source');
  } catch (error) {
    const payload: IMessagePayload = {
      action: 'performance-join-fail',
      params: { message: 'Failed to join the performance', error },
    };

    messager.sendToSender({ event, payload }, sockets);
  }
}

async function controlJoin(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, current_module_title } = body.params;

  const [instance, currentConn]: any[] = await Promise.all([
    ModuleInstance.getWithModule(current_module_title, performance_id),
    Connection.updateByAWSID(event.requestContext.connectionId, { performance_id }),
  ]);

  const currentModule = {
    instance,
    module: {
      title: current_module_title,
    },
  };

  const payload: IMessagePayload = {
    action: 'performance-joined',
    params: { currentConn, currentModule, source: 'control' },
  };
  await messager.sendToSender({ event, payload }, sockets);
}

async function attendeeJoin(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const name = body.params.name ? body.params.name : 'Anonymous';

  const { audience_id, performance_id, current_module_title, attendee_id } = body.params;

  const attendee = await getOrCreateAttendee(attendee_id, name);
  const conParams = { attendee_id: attendee.id, performance_id };

  const [currentConn, audAttend, otherSources, instance] = await Promise.all([
    Connection.updateByAWSID(event.requestContext.connectionId, conParams),
    AuidenceAttendee.create({ audience_id, attendee_id: attendee.id }),
    Connection.getBySource(['control', 'display'], performance_id),
    ModuleInstance.getWithModule(current_module_title, performance_id),
  ]);
  const currentModule = {
    instance,
    module: {
      title: current_module_title,
    },
  };

  const payload: IMessagePayload = {
    action: 'performance-joined',
    params: { attendee, audAttend, currentConn, currentModule, source: 'crowd' },
  };

  const messages = [messager.sendToSender({ event, payload }, sockets)];

  if (otherSources[0]) {
    const ids = otherSources.map((s) => s.aws_connection_id);
    messages.push(messager.sendToIds({ event, payload, ids }, sockets));
  }

  await Promise.all(messages);
}

async function getOrCreateAttendee(attendee_id, name) {
  if (attendee_id) {
    return (await Attendee.getByParam({ id: attendee_id }))[0];
  }

  return await Attendee.create({ name });
}

//////

async function displayJoin(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, current_module_title } = body.params;

  const [instance, currentConn, control]: any[] = await Promise.all([
    ModuleInstance.getWithModule(current_module_title, performance_id),
    Connection.updateByAWSID(event.requestContext.connectionId, { performance_id }),
    Connection.getBySource(['control'], performance_id),
    new Promise((r) => r()), // For some reason Promise.all just needed another promise... don't ask me.
  ]);

  const currentModule = {
    instance,
    module: {
      title: current_module_title,
    },
  };

  const payload: IMessagePayload = {
    action: 'performance-joined',
    params: { currentConn, currentModule, source: 'display' },
  };
  const messages = [messager.sendToSender({ event, payload }, sockets)];

  if (control[0]) {
    messages.push(messager.sendToIds({ event, payload, ids: [control[0].aws_connection_id] }, sockets));
  }

  await Promise.all(messages);
}
