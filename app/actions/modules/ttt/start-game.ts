import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, ModuleInstance } from '../../../../db';
import { ITeam } from '../../../../db/teams';

export async function tttStartGameAction({ body, event, messager, sockets }: IActionElements) {
  const { height, width, currentModule } = body.params;
  const { performance_id, id } = currentModule.instance;
  const [moduleInstances, connections] = await Promise.all([
    ModuleInstance.getByParam({ id }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const { state } = moduleInstances[0];
  const emptyGrid = createEmtpyGrid(height, width);
  const crowdPositions = getRandomCrowdPositions(emptyGrid, state);
  const currentGrid = createCurrentGrid(emptyGrid, crowdPositions);
  const newState = { ...state, previousGrid: emptyGrid, currentGrid };
  const crowdMessages: Promise<any>[] = crowdPositions.map((cp) => {
    const crowdPayload: IMessagePayload = {
      action: 'ttt-game-updated',
      params: { position: cp, grid: emptyGrid },
    };
    return messager.sendToIds({ ids: [cp.awsId], event, payload: crowdPayload }, sockets);
  });

  const payload: IMessagePayload = {
    action: 'ttt-game-updated',
    params: newState,
  };
  const ids = connections.map((c) => c.aws_connection_id);
  await Promise.all([
    messager.sendToIds({ event, payload, ids }, sockets),
    ModuleInstance.update(id, { state: newState }),
    ...crowdMessages,
  ]);
}

function createEmtpyGrid(height, width): Array<ICell[]> {
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

function getRandomCrowdPositions(grid: Array<ICell[]>, { teamO, teamX }: { teamO: ITeam; teamX: ITeam }): IPosition[] {
  const oPositions = getTeamPositions(grid, teamO);
  const xPositions = getTeamPositions(grid, teamX);
  return [...oPositions, ...xPositions];
}

function randomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

function getTeamPositions(grid, team: ITeam): IPosition[] {
  return team.attendee_aws_ids.map((awsId) => {
    return {
      height: randomIndex(grid),
      width: randomIndex(grid[0]),
      team: team.name,
      awsId,
    };
  });
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

interface ICell {
  X: string[];
  O: string[];
  locked: boolean;
  winner: string;
}

interface IPosition {
  height: number;
  width: number;
  team: string;
  awsId: string;
}
