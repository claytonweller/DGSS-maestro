import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Team, Interaction, Connection } from '../../../../db';

export async function boatraceNameBoat(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, data } = body.params;
  const { boat, name } = JSON.parse(data);

  const interactionParams = {
    ...body.params,
    response: name,
    prompt: 'boatrace-name-boat',
  };

  const [team, connections] = await Promise.all([
    Team.update(boat.id, { name }),
    Connection.getBySource(['control', 'display'], performance_id),
    Interaction.create(interactionParams),
  ]);

  const payload: IMessagePayload = {
    action: 'boatrace-boat-named',
    params: { boat: team },
  };

  const crewIds = team.attendee_aws_ids;
  const otherIds = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ event, payload, ids: [...crewIds, ...otherIds] }, sockets);
}
