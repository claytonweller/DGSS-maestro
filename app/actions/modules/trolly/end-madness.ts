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
  console.warn(currentInstance.state);
  const { pastQuestions, currentQuestion } = currentInstance.state;
  const newState = {
    ...currentInstance.state,
    pastQuestions: [...pastQuestions, currentQuestion],
    currentQuestion: {},
  };
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
