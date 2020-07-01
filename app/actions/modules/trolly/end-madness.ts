import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection, ModuleInstance } from '../../../../db';
import { IModuleInstance } from '../../../../db/module_instances';

export async function trollyEndMadnessAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, currentModule } = body.params;
  const { instance }: { instance: IModuleInstance } = currentModule;

  const [connections, moduleInstances] = await Promise.all([
    Connection.getAll(performance_id),
    ModuleInstance.getByParam({ id: instance.id }),
  ]);
  const currentInstance: IModuleInstance = moduleInstances[0];

  const newState = updateState(currentInstance);
  const ids = connections.map((c) => c.aws_connection_id);

  const payload: IMessagePayload = {
    action: 'trolly-madness-over',
    params: newState,
  };

  await Promise.all([
    messager.sendToIds({ event, payload, ids }, sockets),
    ModuleInstance.update(instance.id, { is_active: false, state: newState }),
  ]);
}

function currentQuestionNotSaved(currentQuestion, pastQuestions) {
  const pastQuestionTexts = pastQuestions.map((q) => getQuestionText(q));

  if (Object.keys(currentQuestion).length && pastQuestionTexts.includes(getQuestionText(currentQuestion))) {
    return false;
  }
  return true;
}

function getQuestionText(question) {
  return question.default.text + question.alternative.text;
}

function updateState(currentInstance: IModuleInstance) {
  const { pastQuestions, currentQuestion } = currentInstance.state;

  if (currentQuestionNotSaved(currentQuestion, pastQuestions) && Object.keys(currentQuestion).length) {
    pastQuestions.push(currentQuestion);
  }

  return {
    ...currentInstance.state,
    pastQuestions,
    currentQuestion: {},
  };
}
