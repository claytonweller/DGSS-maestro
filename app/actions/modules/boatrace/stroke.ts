import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Team, ModuleInstance, Connection, Attendee } from '../../../../db';
import { IInteractionParams, Interaction } from '../../../../db/interactions';
import { createCommandQueries, createCommandMessages, createCoxswainCommand } from '.';

export async function boatraceStroke(actionElements: IActionElements) {
  const { body, event } = actionElements;
  const { connectionId: aws_connection_id } = event.requestContext;
  const { boatId } = JSON.parse(body.params.data);

  const boats = await Team.getByParam({ id: boatId });
  const boatAsItIsNow = boats[0];
  const { rowerStatuses } = boatAsItIsNow.state;
  console.warn('OLD STATUS', rowerStatuses);

  const { success, mistake, progressMade, newStatuses } = evaluateStroke(rowerStatuses, aws_connection_id);
  const progress = calculateProgress(boatAsItIsNow);
  console.warn('NEW STATUS', newStatuses);
  if (mistake) {
    await issueNewCommands(boatAsItIsNow, actionElements);
  }

  if (success && !progressMade) {
    await makeSuccessfulStroke(boatAsItIsNow, newStatuses, actionElements);
  }

  if (success && progressMade && progress < 100) {
    await boatProgresses(boatAsItIsNow, progress, actionElements);
  }

  if (success && progressMade && progress >= 100) {
    await boatFinishesRace(boatAsItIsNow, actionElements);
  }
}

/////

const evaluateStroke = (rowerStatuses, aws_connection_id) => {
  return rowerStatuses.reduce(
    (check, status, i) => {
      if (check.mistake || check.success) {
        check.newStatuses.push(status);
        return check;
      }

      const id = Object.keys(status)[0];
      if (status[id] === true) {
        check.newStatuses.push(status);
        return check;
      }
      if (id === aws_connection_id) {
        status[id] = true;
        check.success = true;
        check.progressMade = i + 1 === rowerStatuses.length ? true : false;
      } else {
        check.mistake = true;
      }
      check.newStatuses.push(status);
      return check;
    },
    { success: false, mistake: false, progressMade: false, newStatuses: [] }
  );
};

const saveInteraction = (body, success) => {
  const interactionParams: IInteractionParams = {
    ...body.params,
    response: success ? 'Success' : 'Mistake',
    prompt: 'boatrace-stroke',
  };

  return Interaction.create(interactionParams);
};

const calculateProgress = (boat): number => {
  // TODO this could potentially be more dynamic
  const progress = parseInt(boat.progress);

  // TODO put this back to 15
  if (progress < 50) return progress + 95;
  if (progress < 75) return progress + 10;
  return progress + 5;
};

const issueNewCommands = async (boatAsItIsNow, actionElements) => {
  const [rowers, updatedBoat] = await createCommandQueries(boatAsItIsNow, boatAsItIsNow.progress);
  const commandMessages = createCommandMessages('boatrace-stroke-fail', updatedBoat, rowers, actionElements);
  await Promise.all([...commandMessages, saveInteraction(actionElements.body, false)]);
};

const makeSuccessfulStroke = async (boatAsItIsNow, newStatuses, actionElements) => {
  const { body, event, messager, sockets } = actionElements;
  const params = { state: JSON.stringify({ rowerStatuses: newStatuses }) };
  const rowerIds = newStatuses.map((s) => Object.keys(s)[0]);
  const [updatedBoat, rowers] = await Promise.all([
    Team.update(boatAsItIsNow.id, params),
    Attendee.getByAwsConnectionIds(rowerIds),
  ]);
  const command = createCoxswainCommand(updatedBoat, rowers);
  const ids = [event.requestContext.connectionId, updatedBoat.captain_aws_id];
  const payload: IMessagePayload = { action: 'boatrace-stroke-success', params: { boat: updatedBoat, command } };
  await Promise.all([messager.sendToIds({ event, payload, ids }, sockets), saveInteraction(body, true)]);
};

const boatProgresses = async (boatAsItIsNow, progress, actionElements) => {
  const { body, event, messager, sockets } = actionElements;
  const { module_instance_id, performance_id } = body.params;
  const [moduleInstances, connections, [rowers, updatedBoat]] = await Promise.all([
    ModuleInstance.getByParam({ id: module_instance_id }),
    Connection.getBySource(['display'], performance_id),
    createCommandQueries(boatAsItIsNow, progress.toString()),
  ]);

  const moduleStateNow = moduleInstances[0].state;
  const updatedBoats = moduleStateNow.boats.map((b) => (b.id === updatedBoat.id ? updatedBoat : b));
  const updatedModuleState = JSON.stringify({
    ...moduleStateNow,
    boats: updatedBoats,
  });
  const action = 'boatrace-stroke-progress';

  const displayPayload: IMessagePayload = {
    action,
    params: { boats: updatedBoats },
  };

  const ids = connections.map((c) => c.aws_connection_id);

  await Promise.all([
    ...createCommandMessages(action, updatedBoat, rowers, actionElements),
    ModuleInstance.update(module_instance_id, { state: updatedModuleState }),
    messager.sendToIds({ event, payload: displayPayload, ids }, sockets),
    saveInteraction(body, true),
  ]);
};

const boatFinishesRace = async (boatAsItIsNow, actionElements) => {
  const { body, event, messager, sockets } = actionElements;
  const { module_instance_id, performance_id } = body.params;

  const [moduleInstances, connections] = await Promise.all([
    ModuleInstance.getByParam({ id: module_instance_id }),
    Connection.getBySource(['display', 'control'], performance_id),
  ]);

  const moduleStateNow = moduleInstances[0].state;
  const podiumNow = moduleStateNow.podium;
  const updatedBoat = { ...boatAsItIsNow, progress: '100' };
  const updatedPodium = [...podiumNow, boatAsItIsNow.name];
  const updatedModuleState = {
    boats: moduleStateNow.boats.map((b) => (b.id === updatedBoat.id ? updatedBoat : b)),
    podium: updatedPodium,
  };
  const podiumPosition = updatedPodium.length;

  const action = 'boatrace-stroke-finish';

  const displayPayload: IMessagePayload = {
    action,
    params: updatedModuleState,
  };
  const dislayIds = connections.map((c) => c.aws_connection_id);

  const crewPayload: IMessagePayload = {
    action,
    params: { podiumPosition },
  };
  const crewIds = updatedBoat.attendee_aws_ids;

  await Promise.all([
    ModuleInstance.update(module_instance_id, { state: JSON.stringify(updatedModuleState) }),
    messager.sendToIds({ event, payload: displayPayload, ids: dislayIds }, sockets),
    Team.update(updatedBoat.id, { progress: '100', state: JSON.stringify({ podiumPosition }) }),
    messager.sendToIds({ event, payload: crewPayload, ids: crewIds }, sockets),
    saveInteraction(body, true),
  ]);
};
