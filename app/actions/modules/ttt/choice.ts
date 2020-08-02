import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Interaction, ModuleInstance } from '../../../../db';
import { IInteractionParams } from '../../../../db/interactions';
import { ICell, IPosition } from './start-game';
import { IModuleInstance } from '../../../../db/module_instances';

export async function tttChoiceAction({ body, event, messager, sockets }: IActionElements) {
  const interactionParams: IInteractionParams = {
    ...body.params,
    response: body.params.data,
    prompt: 'ttt-choice',
  };

  const [moduleinstances] = await Promise.all([
    ModuleInstance.getByParam({ id: interactionParams.module_instance_id }),
    Interaction.create(interactionParams),
  ]);
  const moduleInstance: IModuleInstance = moduleinstances[0];
  const { currentGrid } = moduleInstance.state;
  const choice: ITttChoice = JSON.parse(body.params.data);
  const awsId = event.requestContext.connectionId;
  const successfullyRemovedOldPosition = removeOldPosition(currentGrid, choice.team, awsId);
  if (successfullyRemovedOldPosition) await addNewPositionAndupdateState(choice, currentGrid, awsId, moduleInstance);

  const position: IPosition = { ...choice, awsId };
  const payload: IMessagePayload = {
    action: 'ttt-game-updated',
    params: { position },
  };

  await messager.sendToSender({ event, payload }, sockets);
}

//////

const removeOldPosition = (currentGrid: Array<ICell[]>, team: string, awsId: string): boolean => {
  let success = false;
  for (let h = 0; h < currentGrid.length && !success; h++) {
    for (let w = 0; w < currentGrid[h].length && !success; w++) {
      if (currentGrid[h][w][team].includes(awsId)) {
        currentGrid[h][w][team] = currentGrid[h][w][team].filter((id) => id !== awsId);
        success = true;
      }
    }
  }
  return success;
};

const addNewPositionAndupdateState = async (
  choice: ITttChoice,
  currentGrid: Array<ICell[]>,
  awsId: string,
  moduleInstance: IModuleInstance
): Promise<void> => {
  currentGrid[choice.width][choice.height][choice.team].push(awsId);
  const updatedSate = { ...moduleInstance.state, currentGrid };
  await ModuleInstance.update(moduleInstance.id, { state: updatedSate });
};

////

interface ITttChoice {
  width: number;
  height: number;
  team: 'O' | 'X';
}
