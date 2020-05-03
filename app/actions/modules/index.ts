import { IActionElements } from '../';
import { IMessagePayload } from '../messager';
import { preshowActionHash } from './preshow';
import { Module, ModuleInstance, Performance, Connection } from '../../../db';

export const moduleActionHash = {
  ...preshowActionHash,
  'determine-next-module': nextModuleAction,
};

export async function nextModuleAction(actionElements: IActionElements) {
  const { body, event, sockets, messager } = actionElements;
  const currentModuleTitle = body.params.currentModule.module.title;
  const { performance_id } = body.params.currentModule.instance;

  // TODO eventually module selection will be more dynamic with more modules and a less linear setup
  let nextModuleTitle = 'preshow';
  if (currentModuleTitle === 'preshow') nextModuleTitle = 'bootcamp';

  const [modules, performance, connections] = await Promise.all([
    Module.getByParam({ title: nextModuleTitle }),
    Performance.update(performance_id, { current_module_title: nextModuleTitle }),
    Connection.getAll(performance_id),
  ]);

  const instance = await ModuleInstance.create({ performance_id, module_id: modules[0].id });
  const payload: IMessagePayload = {
    // TODO I added in a column to the modules table starting_action_string. May want to replace this with that.
    action: 'start-next-module',
    params: {
      performance,
      currentModule: {
        module: modules[0],
        instance,
      },
    },
  };

  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
