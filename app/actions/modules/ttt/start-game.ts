import { IActionElements } from '../../';
import { Connection, ModuleInstance } from '../../../../db';
import { updateGame, createEmtpyGrid } from './';

export async function tttStartGameAction(actionElements: IActionElements) {
  const { height, width, currentModule } = actionElements.body.params;
  const { performance_id, id } = currentModule.instance;
  const [moduleInstances, nonCrowdConnections] = await Promise.all([
    ModuleInstance.getByParam({ id }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const { state } = moduleInstances[0];
  const emptyGrid = createEmtpyGrid(height, width);
  await updateGame(emptyGrid, state, nonCrowdConnections, actionElements);
}
