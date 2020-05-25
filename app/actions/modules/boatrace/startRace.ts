import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Team, Connection, Attendee } from '../../../../db';

export async function boatraceStartRace(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, id: module_instance_id } = body.params.currentModule.instance;

  const [boats, connections] = await Promise.all([
    Team.getByParam({ module_instance_id }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const queries = createBoatQueries(boats);

  // newBoatInfo - Outer array is all Boats
  // Next Layer is info for a single Boat
  // Final Layer is one Array of attendees/crew, and the boat/team itself
  const newBoatinfo: Array<Array<Array<any> | any>> = await Promise.all(queries);
  const updatedBoats = newBoatinfo.map((info) => info[1]);
  console.warn(updatedBoats);
  const boatMessages = createMessagesForBoats(newBoatinfo, actionElements);
  const ids = connections.map((c) => c.aws_connection_id);
  const payload: IMessagePayload = {
    action: 'boatrace-race-started',
    params: { boats: updatedBoats },
  };
  await Promise.all([messager.sendToIds({ ids, event, payload }, sockets), ...boatMessages]);
}

///////

const createBoatQueries = (boats) => {
  return boats.map((b) => {
    const crewIds = b.attendee_aws_ids.filter((id) => id !== b.captain_aws_id);

    // TODO Changethis to a real number
    const rowerStatuses = selectRandomCrewIds(crewIds, 1);
    const rowerIds = rowerStatuses.map((s) => Object.keys(s)[0]);
    return Promise.all([
      Attendee.getByAwsConnectionIds(rowerIds),
      Team.update(b.id, { progress: '0', state: JSON.stringify({ rowerStatuses }) }),
    ]);
  });
};

const selectRandomCrewIds = (ids, count) => {
  let rowerStatuses: { [key: string]: boolean }[] = [];
  while (rowerStatuses.length < count || rowerStatuses.length < ids.length) {
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    if (!rowerStatuses.includes(randomId)) {
      rowerStatuses.push({ [randomId]: false });
    }
  }
  return rowerStatuses;
};

const createMessagesForBoats = (newBoatinfo, actionElements: IActionElements) => {
  return newBoatinfo.reduce((messages, info) => {
    const boat = info[1];
    const rowers = info[0];
    const coxswainCommand = createCoxswainCommand(boat, rowers);
    const coxswainMessage = createCoxswainMessage(coxswainCommand, boat, actionElements);
    const crewMessage = createCrewMessage(boat, actionElements);

    return [...messages, coxswainMessage, crewMessage];
  }, []);
};

const createCoxswainCommand = (boat, rowers) => {
  const { rowerStatuses } = boat.state;

  return rowers.map((r, i) => {
    const matchedRowerInState = rowerStatuses.filter((status) => Object.keys(status)[0] === r.aws_connection_id)[0];
    const hasRowed = matchedRowerInState[r.aws_connection_id];
    return {
      aws_connection_id: r.aws_connection_id,
      name: r.name,
      position: i + 1,
      hasRowed,
    };
  });
};

const createCoxswainMessage = (coxswainCommand, boat, actionElements: IActionElements) => {
  const { event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'boatrace-race-started',
    params: { coxswainCommand },
  };

  return messager.sendToIds({ ids: [boat.captain_aws_id], event, payload }, sockets);
};

const createCrewMessage = (boat, actionElements: IActionElements) => {
  const { event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: 'boatrace-race-started',
    params: {},
  };
  const crewIds = boat.attendee_aws_ids.filter((id) => id !== boat.captain_aws_id);
  return messager.sendToIds({ ids: crewIds, payload, event }, sockets);
};
