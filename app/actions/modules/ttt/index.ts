import { tttGridAction } from './grid';
import { tttTitleAction } from './title';
import { tttTeamsAction } from './teams';
import { tttStartGameAction } from './start-game';
import { tttNextRoundAction } from './next-round';
import { tttChoiceAction } from './choice';
import { tttEndGameAction } from './end-game';

export const tttActionHash = {
  'ttt-grid': tttGridAction,
  'ttt-title': tttTitleAction,
  'ttt-teams': tttTeamsAction,
  'ttt-start-game': tttStartGameAction,
  'ttt-next-round': tttNextRoundAction,
  'ttt-choice': tttChoiceAction,
  'ttt-end-game': tttEndGameAction,
};
