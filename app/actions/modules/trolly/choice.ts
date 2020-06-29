import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { IInteractionParams } from '../../../../db/interactions';
import { Connection, Interaction, ModuleInstance } from '../../../../db';

export async function trollyChoiceAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, data, module_instance_id } = body.params;
  const choice: ITrollyChoice = JSON.parse(data);

  const interactionParams: IInteractionParams = {
    ...body.params,
    response: choice.response,
    prompt: choice.prompt,
  };

  const [instances, connections] = await Promise.all([
    ModuleInstance.getByParam({ id: module_instance_id }),
    Connection.getBySource(['display'], performance_id),
    Interaction.create(interactionParams),
  ]);
  const oldState = instances[0].state;
  const newQuestionState = updateCounts(oldState, choice);

  const state = {
    ...oldState,
    currentQuestion: newQuestionState,
  };

  const displayConnectionIds = connections.map((c) => c.aws_connection_id);

  const payload: IMessagePayload = {
    action: 'trolly-choice-made',
    params: { currentQuestion: newQuestionState },
  };

  await Promise.all([
    ModuleInstance.update(module_instance_id, { state }),
    messager.sendToIds({ event, payload, ids: [...displayConnectionIds, event.requestContext.connectionId] }, sockets),
  ]);
}

const updateCounts = (oldState, choice) => {
  const { currentQuestion: oldQuestionState } = oldState;

  return ['default', 'alternative'].reduce((newState, key) => {
    const oldText = oldQuestionState[key].text;
    newState[key] = { text: oldText, count: oldQuestionState[key].count - 1 };
    if (oldText === choice.response) {
      newState[key].count = oldQuestionState[key].count + 1;
    }
    return newState;
  }, {});
};

interface ITrollyChoice {
  default: { text: string; chosen: boolean };
  alternative: { text: string; chosen: boolean };
  intentional: boolean; // Whether the choice is intentional or by them not selecting anything
  response: string;
  prompt: string;
}
