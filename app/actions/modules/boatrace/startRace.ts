import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Team, Connection } from '../../../../db';
import { createCommandMessages, createCommandQueries } from '.';

export async function boatraceStartRace(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, id: module_instance_id } = body.params.currentModule.instance;

  const [boats, connections] = await Promise.all([
    Team.getByParam({ module_instance_id }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const queries = createCommandQueriesForAllBoats(boats);

  // newBoatInfo - Outer array is all Boats
  // Next Layer is info for a single Boat
  // Final Layer is one Array of attendees/crew, and the boat/team itself
  const newBoatinfo: Array<Array<Array<any> | any>> = await Promise.all(queries);
  const updatedBoats = newBoatinfo.map((info) => info[1]);
  const boatMessages = createMessagesForBoats(newBoatinfo, actionElements);
  const ids = connections.map((c) => c.aws_connection_id);
  const payload: IMessagePayload = {
    action: 'boatrace-race-started',
    params: { boats: updatedBoats },
  };
  await Promise.all([messager.sendToIds({ ids, event, payload }, sockets), ...boatMessages]);
}

///////

const createCommandQueriesForAllBoats = (boats) => {
  return boats.map((boat) => {
    return createCommandQueries(boat);
  });
};

const createMessagesForBoats = (newBoatinfo, actionElements: IActionElements) => {
  return newBoatinfo.reduce((messages, info) => {
    const boat = info[1];
    const rowers = info[0];
    const commandMessages = createCommandMessages('boatrace-race-started', boat, rowers, actionElements);
    return [...messages, ...commandMessages];
  }, []);
};
