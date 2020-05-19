import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Team, Connection } from '../../../../db';

export async function boatraceStartNamingBoats(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, id } = body.params.currentModule.instance;

  const [boats, otherConnections] = await Promise.all([
    Team.getByParam({ module_instance_id: id }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const idsForPeopleInBoats = boats.reduce((ids, boat) => {
    return [...ids, ...boat.attendee_aws_ids];
  }, []);

  const payload: IMessagePayload = {
    action: 'boatrace-open-for-naming',
    params: {},
  };
  const otherIds = otherConnections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids: [...idsForPeopleInBoats, ...otherIds], event, payload }, sockets);
}
