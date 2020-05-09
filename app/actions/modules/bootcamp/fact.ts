import { IActionElements } from '../../';
import { Interaction, Module, Connection } from '../../../../db';
import { IMessagePayload } from '../../messager';

export async function bootcampFactAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;
  const [modules, connections] = await Promise.all([
    Module.getByParam({ title: 'preshow' }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);
  const module_id = modules[0].id;
  const interactions = await Interaction.getByParam({ performance_id, module_id });
  const questionInteractions = interactions.filter((int) => {
    int.data.question && int.response !== '-skip-' && int.prompt !== 'What name do you want to use tonight?';
  });
  const randomFact = questionInteractions[Math.floor(Math.random() * questionInteractions.length)];
  const payload: IMessagePayload = {
    action: 'bootcamp-fact',
    params: randomFact,
  };
  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}
