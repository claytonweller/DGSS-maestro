import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Team } from '../../../../db';
import { IInteractionParams, Interaction } from '../../../../db/interactions';
import { createCommandQueries, createCommandMessages } from '.';

export async function boatraceStroke(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;
  const { connectionId: aws_connection_id } = event.requestContext;
  const { boatId } = JSON.parse(body.params.data);

  const boats = await Team.getByParam({ id: boatId });
  const { rowerStatuses } = boats[0].state;

  const { success, mistake, progress /*newStatuses*/ } = rowerStatuses.reduce(
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
        check.progress = i + 1 === rowerStatuses.length ? true : false;
      } else {
        check.mistake = true;
      }
      check.newStatuses.push(status);
      return check;
    },
    { success: false, mistake: false, progress: false, newStatuses: [] }
  );

  const interactionParams: IInteractionParams = {
    ...body.params,
    response: success ? 'Success' : 'Mistake',
    prompt: 'boatrace-stroke',
  };

  // TODO there's probably a better place to put this
  await Interaction.create(interactionParams);

  if (mistake) {
    const commandQueries = await createCommandQueries(boats[0]);
    const [boat, rowers] = commandQueries;
    const commandMessages = createCommandMessages('boatrace-stroke-fail', boat, rowers, actionElements);
    await Promise.all(commandMessages);
  }

  if (success && !progress) {
    // Update team state
    // Send update to coxswain
    // Send feedback to rower
  }

  if (success && progress) {
    // Create new command
    // Calculate progress
    // Check for completion/victory
    // Update team state
    // Send feedback to all rowers
    // send update to coxswain
    // send update to Display
  }

  const payload: IMessagePayload = {
    action: 'boatrace-stroke-result',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
