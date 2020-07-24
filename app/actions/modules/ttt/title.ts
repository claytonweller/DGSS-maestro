import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Connection } from '../../../../db';

export async function tttTitleAction({ body, event, messager, sockets }: IActionElements) {
  const { performance_id } = body.params.currentModule.instance;
  const connections = await Connection.getBySource(['display'], performance_id);
  const payload: IMessagePayload = {
    action: 'ttt-show-title',
    params: {},
  };

  const displayIds = connections.map((c) => c.aws_connection_id);

  await messager.sendToIds({ event, payload, ids: displayIds }, sockets);
}
