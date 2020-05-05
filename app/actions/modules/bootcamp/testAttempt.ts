import { IActionElements } from '../..';
import { Connection, Interaction } from '../../../../db';
import { IMessagePayload } from '../../messager';

export async function bootcampTestAttempAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;

  const interactionParams = {
    ...body.params,
    response: 'success',
    prompt: 'bootcamp-test-attempt',
  };

  const [connections, interaction] = await Promise.all([
    Connection.getBySource(['control', 'display'], performance_id),
    Interaction.create(interactionParams),
  ]);

  const payload: IMessagePayload = {
    action: 'bootcamp-test-success',
    params: interaction,
  };

  const ids = connections.map((c) => c.aws_connection_id);
  await Promise.all([
    messager.sendToIds({ ids, event, payload }, sockets),
    messager.sendToSender({ event, payload }, sockets),
  ]);
}
