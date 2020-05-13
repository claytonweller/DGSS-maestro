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

export const boatraceActionHash = {
  'boatrace-title': boatraceTitleAction,
  'boatrace-create-boats': boatraceCreateBoatsAction,
  'boatrace-board-boat': boatraceBoardBoatAction,
  'boatrace-select-cockswains': boatraceSelectCoxswains,
  'boatrace-start-naming-boats': boatraceStartNamingBoats,
  'boatrace-name-boat': boatraceNameBoat,
  'boatrace-stop-naming-boats': boatraceStopNamingBoats,
  'boatrace-reveal-boat-name': boatraceRevealBoatName,
  'boatrace-next-instruction': boatraceNextInstruction,
  'boatrace-start-race': boatraceStartRace,
  'boatrace-stroke': boatraceStroke,
  'boatrace-end-race': () => boatraceEndRace,
};
