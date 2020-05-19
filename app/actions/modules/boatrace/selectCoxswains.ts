import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Team, Attendee, Connection } from '../../../../db';

// TODO much of this could probably be repurposed and generalized for Team creation in other modules.

export async function boatraceSelectCoxswains(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { instance } = body.params.currentModule;
  const { performance_id, id } = instance;

  const endBoardingPayload: IMessagePayload = { action: 'boatrace-boarding-over', params: {} };
  const endBoardingMessage = messager.sendToAll({ performance_id, event, payload: endBoardingPayload }, sockets);

  const [boats, attendees, connections] = await Promise.all([
    Team.getByParam({ module_instance_id: id }),
    Attendee.getByPerfomanceId(performance_id),
    Connection.getBySource(['control', 'display'], performance_id),
    endBoardingMessage,
  ]);

  const { liveBoats, deadBoats } = removeDeadBoats(boats, 2);

  const boatsWithCoxswains = liveBoats.map((b) => {
    const coxswain = selectCoxswain(b, attendees);
    return {
      ...b,
      captain_name: coxswain.name,
      captain_aws_id: coxswain.aws_connection_id,
    };
  });

  const payload: IMessagePayload = {
    action: 'boatrace-coxswains-selected',
    params: {
      boats: boatsWithCoxswains,
    },
  };

  const messages = createTeamMessages(payload, boatsWithCoxswains, actionElements);
  const ids = connections.map((c) => c.aws_connection_id);
  messages.push(messager.sendToIds({ ids, event, payload }, sockets));
  const deadBoatsToSink = deadBoats.map((b) => Team.remove(b.id));

  await Promise.all([...messages, ...deadBoatsToSink]);
}

///////

const removeDeadBoats = (boats, minSize) => {
  const { crewInNeedofBoat, liveBoats, deadBoats } = boats.reduce(
    (split, b) => {
      if (b.attendee_aws_ids.length >= minSize) {
        split.liveBoats.push(b);
      } else {
        const crew = b.attendee_aws_ids.map((i) => {
          return { attendee_aws_ids: i, deadBoatId: b.id };
        });
        split.crewInNeedofBoat = [...split.crewInNeedofBoat, ...crew];
        split.deadBoats.push(b);
      }
      return split;
    },
    { crewInNeedofBoat: [], liveBoats: [], deadBoats: [] }
  );

  crewInNeedofBoat.forEach((c) => {
    const closestBoat = liveBoats.reduce(
      (closestBoat, b) => {
        const isClosest = Math.abs(b.id - c.deadBoatId) < Math.abs(closestBoat.id - c.deadBoatId);
        if (isClosest) {
          console.log(b);
          return b;
        }
        return closestBoat;
      },
      { id: -1 }
    );
    closestBoat.attendee_aws_ids.push(c.attendee_aws_ids);
  });

  return { liveBoats, deadBoats };
};

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

const createTeamMessages = (payload, boatsWithCoxswains, actionElements) => {
  const { event, messager, sockets } = actionElements;
  return boatsWithCoxswains.reduce((msgs, boat) => {
    const { captain_aws_id, captain_name, attendee_aws_ids } = boat;
    const cxswnPayload: IMessagePayload = { ...payload, params: { boat, youAreCoxswain: true } };
    const toCoxswain = messager.sendToIds({ event, payload: cxswnPayload, ids: [captain_aws_id] }, sockets);

    const crewPayload: IMessagePayload = { ...payload, params: { boat, youAreCoxswain: false } };
    const crewIds = boat.attendee_aws_ids.filter((id) => id !== captain_aws_id);
    const toCrew = messager.sendToIds({ event, payload: crewPayload, ids: crewIds }, sockets);

    const teamUpdate = Team.update(boat.id, { captain_name, captain_aws_id, attendee_aws_ids });

    return [...msgs, toCoxswain, toCrew, teamUpdate];
  }, []);
};
