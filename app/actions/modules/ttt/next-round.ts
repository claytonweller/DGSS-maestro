import { IActionElements } from '../../';
import { ModuleInstance, Connection } from '../../../../db';
// import { IMessagePayload } from '../../messager';
import { ICell, createEmtpyGrid } from '.';
import { writeFileSync } from 'fs';

export async function tttNextRoundAction(actionElements: IActionElements) {
  const { performance_id, id } = actionElements.body.params.currentModule.instance;

  const [moduleInstances] = await Promise.all([
    ModuleInstance.getByParam({ id }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const { state } = moduleInstances[0];
  const { currentGrid } = state;

  const winnerGrid = calculateWinners(currentGrid);
  const points = calculatePoints(winnerGrid);
  console.warn(winnerGrid);
  writeFileSync('./CRAP.json', JSON.stringify(winnerGrid));
  console.warn(points);
  // Create new state
  // (maybe) Update teams?
  // updateGame()

  // const payload: IMessagePayload = {
  //   action: 'ttt-next-round-results',
  //   params: { currentQuestion: body },
  // };

  // await messager.sendToSender({ event, payload }, sockets);
}

////

const calculateWinners = (grid: ICell[][]): ICell[][] => {
  return grid.map((row) => {
    return row.map(
      (cell: ICell): ICell => {
        const blankCell = { X: [], O: [], winner: '', locked: false };
        if (cell.X.length > cell.O.length) return { ...cell, locked: true, winner: 'X' };
        if (cell.O.length > cell.X.length) return { ...cell, locked: true, winner: 'O' };
        if (cell.O.length && cell.X.length) return { ...blankCell, winner: '-' };
        return blankCell;
      }
    );
  });
};

/////

const calculatePoints = (grid: ICell[][]): IPoints => {
  const rotatedGrid = rotateGrid(grid);
  const skewedGrid = skewGrid(grid);
  const skewedRotatedGrid = skewGrid(rotatedGrid);
  const horizontalPoints = getHorizontalPoints(grid);
  const verticalPoints = getHorizontalPoints(rotatedGrid);
  const downDiagonalPoints = getHorizontalPoints(skewedGrid);
  const upDiagonalPoints = getHorizontalPoints(skewedRotatedGrid);
  const fractionArray = [horizontalPoints, verticalPoints, downDiagonalPoints, upDiagonalPoints];
  return totalPoints(fractionArray);
};

const rotateGrid = (grid: ICell[][]): ICell[][] => {
  return grid.reduce(
    (rotated, row) => {
      row.forEach((cell: ICell, i) => rotated[i].unshift(cell));
      return rotated;
    },
    grid[0].map((): ICell[] => [])
  );
};

const skewGrid = (grid: ICell[][]): ICell[][] => {
  const blankSkewed = createEmtpyGrid(grid.length + grid[0].length - 1, grid[0].length);
  return grid.reduce((skewed, row, i) => {
    row.forEach((cell: ICell, j) => {
      skewed[i + j][j] = cell;
    });
    return skewed;
  }, blankSkewed);
};

const getHorizontalPoints = (grid: ICell[][]): IPoints => {
  return grid.reduce(
    (points, row) => {
      row.reduce((slots: string[], cell: ICell) => {
        if (slots.length && cell.winner !== slots[slots.length - 1]) slots = [];
        slots.push(cell.winner);
        if ((cell.winner === 'X' || cell.winner === 'O') && slots.length > 2) {
          points[cell.winner]++;
          slots.pop();
        }
        return slots;
      }, []);
      return points;
    },
    { X: 0, O: 0 }
  );
};

const totalPoints = (fractionArray: IPoints[]): IPoints => {
  return fractionArray.reduce(
    (points, fraction) => {
      Object.keys(fraction).forEach((k) => (points[k] += fraction[k]));
      return points;
    },
    { X: 0, O: 0 }
  );
};

///
interface IPoints {
  X: number;
  O: number;
}
