import { Performance, Audience, Connection, Module, ModuleInstance } from "../../../db"
import { IActionElements } from "../";

export async function createPerformanceAction(actionElements: IActionElements) {
  const { event, messager, sockets } = actionElements
  const control_aws_id = event.requestContext.connectionId
  const performanceParams = {
    control_aws_id,
    current_module_title: 'preshow'
  }
  const performance = await Performance.create(performanceParams)
  const preshowModule = await Module.getByParam({ title: 'preshow' })
  const performance_id = performance.id
  const queries = [
    Connection.updateByAWSID(control_aws_id, { performance_id }),
    Audience.create({ performance_id: performance.id, size: 0 }),
    Connection.removeAll(performance.id),
    ModuleInstance.create({ performance_id, module_id: preshowModule[0].id })
  ]
  const res = await Promise.all(queries)
  const updatedPerformance = await Performance.update(performance.id, { audience_id: res[1].id })
  const payload = {
    action: 'performance-created',
    params: {
      performance: updatedPerformance,
      currentModule: {
        module: preshowModule[0],
        instance: res[3]
      }
    }
  }
  await messager.sendToSender({ event, payload }, sockets)
}