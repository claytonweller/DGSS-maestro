import { boatraceTitleAction } from './title';
import { boatraceCreateBoatsAction } from './createBoats';
import { boatraceBoardBoatAction } from './boardBoat';
import { boatraceSelectCoxswains } from './selectCoxswains';
import { boatraceStartNamingBoats } from './startNamingBoats';
import { boatraceNameBoat } from './nameBoat';
import { boatraceStopNamingBoats } from './stopNamingBoats';
import { boatraceRevealBoatName } from './revealBoatName';
import { boatraceNextInstruction } from './nextInstruction';
import { boatraceStartRace } from './startRace';
import { boatraceEndRace } from './endRace';
import { boatraceStroke } from './stroke';
import { boatraceInstructionsComplete } from './instructionsComplete';
import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Attendee, Team } from '../../../../db';

export const boatraceActionHash = {
  'boatrace-title': boatraceTitleAction, // Control
  'boatrace-reveal-boat-name': boatraceRevealBoatName, // Control
  'boatrace-next-instruction': boatraceNextInstruction, // Control
  'boatrace-instructions-complete': boatraceInstructionsComplete, // Display
  'boatrace-start-race': boatraceStartRace, // Control
  'boatrace-stroke': boatraceStroke, // Crowd
  'boatrace-end-race': boatraceEndRace, // Control

  // TODO these functions may be generalizable to other 'team' based modules
  'boatrace-create-boats': boatraceCreateBoatsAction, // Control
  'boatrace-board-boat': boatraceBoardBoatAction, // Crowd
  'boatrace-select-cockswains': boatraceSelectCoxswains, // Control
  'boatrace-start-naming-boats': boatraceStartNamingBoats, // Control
  'boatrace-name-boat': boatraceNameBoat, // Crowd
  'boatrace-stop-naming-boats': boatraceStopNamingBoats, // Control
};

/////
// This makes a new command for the coxswain of a given boat, and updates the Team.
export const createCommandQueries = (boat) => {
  const crewIds = boat.attendee_aws_ids.filter((id) => id !== boat.captain_aws_id);
  // TODO Changethis to a real number
  const rowerStatuses = selectRandomCrewIds(crewIds, 2);
  const rowerIds = rowerStatuses.map((s) => Object.keys(s)[0]);
  return Promise.all([
    Attendee.getByAwsConnectionIds(rowerIds),
    Team.update(boat.id, { progress: '0', state: JSON.stringify({ rowerStatuses }) }),
  ]);
};

const selectRandomCrewIds = (ids, count) => {
  let rowerStatuses: { [key: string]: boolean }[] = [];
  while (rowerStatuses.length < count && 0 < ids.length) {
    const randomIndex = Math.floor(Math.random() * ids.length);
    const randomId = ids[randomIndex];
    rowerStatuses.push({ [randomId]: false });
    ids.splice(randomIndex, 1);
  }
  return rowerStatuses;
};

//////////
// This sends the coxwain command to the appropriate ids
export const createCommandMessages = (actionString, boat, rowers, actionElements) => {
  const coxswainCommand = createCoxswainCommand(boat, rowers);
  const coxswainMessage = createCoxswainCommandMessage(actionString, coxswainCommand, boat, actionElements);
  const crewMessage = createCrewCommandMessageMessage(actionString, boat, actionElements);
  return [coxswainMessage, crewMessage];
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

const createCoxswainCommandMessage = (actionString, coxswainCommand, boat, actionElements: IActionElements) => {
  const { event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: actionString,
    params: { coxswainCommand },
  };

  return messager.sendToIds({ ids: [boat.captain_aws_id], event, payload }, sockets);
};

const createCrewCommandMessageMessage = (actionString, boat, actionElements: IActionElements) => {
  const { event, messager, sockets } = actionElements;

  const payload: IMessagePayload = {
    action: actionString,
    params: {},
  };
  const crewIds = boat.attendee_aws_ids.filter((id) => id !== boat.captain_aws_id);
  return messager.sendToIds({ ids: crewIds, payload, event }, sockets);
};
