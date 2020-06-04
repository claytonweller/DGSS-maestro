import { IActionElements } from '../..';
import { IMessagePayload } from '../../messager';
import { Team, ModuleInstance } from '../../../../db';

export async function boatraceEndRace(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, id: module_instance_id } = body.params.currentModule.instance;

  const [boats, moduleInstances] = await Promise.all([
    Team.getByParam({ module_instance_id }),
    ModuleInstance.getByParam({ id: module_instance_id }),
  ]);
  const { podium } = moduleInstances[0].state;
  const unFinishedBoats = boats
    .filter((b) => parseInt(b.progress) < 100)
    .sort((a, b) => parseInt(b.progress) - parseInt(a.progress));

  const unfishedPodium = unFinishedBoats.reduce((unfinished, b) => {
    return [...unfinished, b.name];
  }, []);
  const completePodium = [...podium, ...unfishedPodium];

  const payload: IMessagePayload = {
    action: 'boatrace-race-ended',
    params: { podium: completePodium },
  };

  await messager.sendToAll({ performance_id, event, payload }, sockets);
}
