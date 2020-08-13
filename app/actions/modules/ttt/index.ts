import { tttGridAction } from './grid';
import { tttTitleAction } from './title';
import { tttTeamsAction } from './teams';
import { tttStartGameAction } from './start-game';
import { tttNextRoundAction } from './next-round';
import { tttChoiceAction } from './choice';
import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { tttEndGameAction } from './end-game';
import { ModuleInstance } from '../../../../db';
import { ITeam } from '../../../../db/teams';
import { IConnection } from '../../../../db/connections';

export const tttActionHash = {
  'ttt-grid': tttGridAction,
  'ttt-title': tttTitleAction,
  'ttt-teams': tttTeamsAction,
  'ttt-start-game': tttStartGameAction,
  'ttt-next-round': tttNextRoundAction,
  'ttt-choice': tttChoiceAction,
  'ttt-end-game': tttEndGameAction,
};

/////
export function createEmtpyGrid(height, width): Array<ICell[]> {
  const grid: Array<ICell[]> = [];
  // Create Rows
  for (let i = 0; i < height; i++) {
    grid.push([]);
  }

  // Creat a cell for every column in a row
  grid.forEach((row) => {
    for (let i = 0; i < width; i++) {
      const cell = { X: [], O: [], locked: false, winner: '' };
      row.push(cell);
    }
  });
  return grid;
}

////

export const updateGame = async (
  previousGrid: ICell[][],
  state: IGameState,
  nonCrowdConnections: IConnection[],
  { body, messager, sockets, event }: IActionElements
) => {
  const { id } = body.params.currentModule.instance;
  const crowdPositions = getRandomCrowdPositions(previousGrid, state);
  const currentGrid = createCurrentGrid(previousGrid, crowdPositions);
  const newState = { ...state, previousGrid: previousGrid, currentGrid };
  const crowdMessages: Promise<any>[] = crowdPositions.map((cp) => {
    const crowdPayload: IMessagePayload = {
      action: 'ttt-game-updated',
      params: { position: cp, grid: previousGrid },
    };
    return messager.sendToIds({ ids: [cp.awsId], event, payload: crowdPayload }, sockets);
  });

  const payload: IMessagePayload = {
    action: 'ttt-game-updated',
    params: newState,
  };
  const ids = nonCrowdConnections.map((c) => c.aws_connection_id);
  await Promise.all([
    messager.sendToIds({ event, payload, ids }, sockets),
    ModuleInstance.update(id, { state: newState }),
    ...crowdMessages,
  ]);
};

function getRandomCrowdPositions(grid: Array<ICell[]>, { teamO, teamX }: { teamO: ITeam; teamX: ITeam }): IPosition[] {
  const oPositions = getTeamPositions(grid, teamO);
  const xPositions = getTeamPositions(grid, teamX);
  return [...oPositions, ...xPositions];
}

function getTeamPositions(grid: ICell[][], team: ITeam): IPosition[] {
  return team.attendee_aws_ids.map((awsId) => {
    return {
      height: randomIndex(grid),
      width: randomIndex(grid[0]),
      team: team.name,
      awsId,
    };
  });
}

function randomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

function createCurrentGrid(previousGrid: Array<ICell[]>, crowdPositions: IPosition[]): Array<ICell[]> {
  const grid = iterativelyCopyObject(previousGrid) as Array<ICell[]>;
  crowdPositions.forEach((p) => {
    grid[p.height][p.width][p.team].push(p.awsId);
  });

  return grid;
}

function iterativelyCopyObject(src) {
  let target = Array.isArray(src) ? [] : {};
  for (let prop in src) {
    if (src.hasOwnProperty(prop)) {
      // if the value is a nested object, recursively copy all it's properties
      target[prop] = isObject(src[prop]) ? iterativelyCopyObject(src[prop]) : src[prop];
    }
  }
  return target;
}

function isObject(obj) {
  var type = typeof obj;
  return type === 'function' || (type === 'object' && !!obj);
}

///////////

export interface ICell {
  X: string[];
  O: string[];
  locked: boolean;
  winner: string;
}

export interface IPosition {
  height: number;
  width: number;
  team: string;
  awsId: string;
}

export interface IGameState {
  teamO: ITeam;
  teamX: ITeam;
  currentGrid: ICell[][];
  previousGrid: ICell[][];
}
