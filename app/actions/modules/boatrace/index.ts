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
