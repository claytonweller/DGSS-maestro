import { boatraceActionHash } from './boatrace';
import { IActionElements } from '../';
import { IMessagePayload } from '../messager';
import { preshowActionHash } from './preshow';
import { Module, ModuleInstance, Performance, Connection } from '../../../db';
import { bootcampActionHash } from './bootcamp';

export const moduleActionHash = {
  ...boatraceActionHash,
  ...preshowActionHash,
  ...bootcampActionHash,
  'determine-next-module': nextModuleAction,
  'jump-to-module': jumpToModuleAction,
};

async function switchModules(moduleTitle, actionElements: IActionElements) {
  const { body, event, sockets, messager } = actionElements;
  const { performance_id, id } = body.params.currentModule.instance;

  const [modules, performance, connections] = await Promise.all([
    Module.getByParam({ title: moduleTitle }),
    Performance.update(performance_id, { current_module_title: moduleTitle }),
    Connection.getAll(performance_id),
    ModuleInstance.update(id, { completed_at: new Date().toISOString() }),
  ]);

  const moduleId = modules[0] && modules[0].id;
  if (!moduleId) {
    const payload: IMessagePayload = {
      action: 'module-switch-fail',
      params: { message: `Module ${moduleTitle} not found` },
    };
    return await messager.sendToSender({ event, payload }, sockets);
  }

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

async function jumpToModuleAction(actionElements: IActionElements) {
  const { moduleTitle } = actionElements.body.params;
  await switchModules(moduleTitle, actionElements);
}

async function nextModuleAction(actionElements: IActionElements) {
  const { currentModule } = actionElements.body.params;
  const currentModuleTitle = currentModule.module.title;

  // TODO eventually module selection will be more dynamic with more modules and a less linear setup
  let nextModuleTitle = 'preshow';
  if (currentModuleTitle === 'preshow') nextModuleTitle = 'bootcamp';

  switchModules(nextModuleTitle, actionElements);
}
