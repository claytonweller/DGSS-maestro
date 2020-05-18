import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Team, Attendee, Connection } from '../../../../db';

export async function boatraceSelectCoxswains(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { instance } = body.params.currentModule;
  const { performance_id, id } = instance;

  const [boats, attendees, connections] = await Promise.all([
    Team.getByParam({ module_instance_id: id }),
    Attendee.getByPerfomanceId(performance_id),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const boatsWithCoxswains = boats.map((b) => {
    const coxswain = selectCoxswain(b, attendees);
    // What happens if no one is in the boat?
    const boat = {
      ...b,
      captain_name: coxswain.name,
      captain_aws_id: coxswain.aws_connection_id,
    };
    return { coxswain, boat };
  });

  // Need to updated boats with captains.

  const payload: IMessagePayload = {
    action: 'boatrace-coxswain-selected',
    params: {
      boats: boatsWithCoxswains,
    },
  };

  const messages = boatsWithCoxswains.reduce((msgs, { boat, coxswain }) => {
    const cxswnPayload: IMessagePayload = { ...payload, params: { coxswain, boat } };
    const toCoxswain = messager.sendToIds({ event, payload: cxswnPayload, ids: [coxswain.aws_connection_id] }, sockets);

    const crewPayload: IMessagePayload = { ...payload, params: { boat } };
    const crewIds = boat.attendee_aws_ids.filter((id) => id !== coxswain.aws_connection_id);
    const toCrew = messager.sendToIds({ event, payload: crewPayload, ids: crewIds }, sockets);

    return [...msgs, toCoxswain, toCrew];
  }, []);

  const ids = connections.map((c) => c.aws_connection_id);
  messages.push(messager.sendToIds({ ids, event, payload }, sockets));

  await Promise.all(messages);
  // Need to send notification to Crowd/control
}

const selectCoxswain = (boat, attendees) => {
  const { coxswain } = boat.attendee_aws_ids.reduce(
    (cxswn, id) => {
      const candidate = attendees.find((a) => a.aws_connection_id === id);
      const interest = rankInterest(candidate.center_of_attention);
      if (interest > cxswn.interest) {
        return { coxswain: candidate, interest };
      }
      return cxswn;
    },
    { interest: -1 }
  );
  return coxswain;
};

const rankInterest = (string) => {
  if (string === 'Great') return 4;
  if (string === 'Good') return 3;
  if (string === 'Fine') return 2;
  if (string === "Don't even look at me") return 0;
  return 1;
};
