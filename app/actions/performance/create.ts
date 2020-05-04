import { Performance, Audience, Connection, Module, ModuleInstance } from '../../../db';
import { IActionElements } from '../';

export async function createPerformanceAction(actionElements: IActionElements) {
  const { event, messager, sockets } = actionElements;
  const control_aws_id = event.requestContext.connectionId;
  const performanceParams = {
    control_aws_id,
    current_module_title: 'preshow',
  };
  const [performance, preshowModule] = await Promise.all([
    Performance.create(performanceParams),
    Module.getByParam({ title: 'preshow' }),
  ]);

  const performance_id = performance.id;
  const [audience, instance, currentConn] = await Promise.all([
    Audience.create({ performance_id, size: 0 }),
    ModuleInstance.create({ performance_id, module_id: preshowModule[0].id }),
    Connection.updateByAWSID(control_aws_id, { performance_id }),
  ]);

  const [updatedPerformance] = await Promise.all([
    Performance.update(performance_id, { audience_id: audience.id }),
    Connection.removeAllBefore(performance_id),
  ]);
  const payload = {
    action: 'performance-created',
    params: {
      performance: updatedPerformance,
      currentConn,
      currentModule: {
        module: preshowModule[0],
        instance,
      },
    },
  };
  await messager.sendToSender({ event, payload }, sockets);
}
