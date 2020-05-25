import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';
import { Team, Connection } from '../../../../db';

export async function boatraceStopNamingBoats(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, id } = body.params.currentModule.instance;

  const [boats, otherConnections] = await Promise.all([
    Team.getByParam({ module_instance_id: id }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const boatsWithNames = nameNamelessBoats(boats);

  const payload: IMessagePayload = {
    action: 'boatrace-naming-closed',
    params: { boats: boatsWithNames },
  };

  const idsForPeopleInBoats = boatsWithNames.reduce((ids, boat) => {
    return [...ids, ...boat.attendee_aws_ids];
  }, []);
  const otherIds = otherConnections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids: [...idsForPeopleInBoats, ...otherIds], event, payload }, sockets);
}

const nameNamelessBoats = (boats) => {
  return boats.map((b) => {
    if (!isNaN(parseInt(b.name))) {
      b.name = generateBoatName();
    }
    return b;
  });
};

const generateBoatName = () => {
  const randomIndex = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const prefixes = ['S.S. ', 'R.M.S. ', 'H.M.S. ', ''];
  const adjectives = [
    'Bumpy',
    'Splish-splash',
    'Forgetful',
    'Meandering',
    'Original',
    'Covert',
    'Maligned',
    'Empirical',
    '',
  ];
  const nouns = ['Steve', 'Carol', 'Mark', 'Diane', 'Kenneth', 'Becky', 'Ron', 'Samantha', 'Drew', 'Penelope'];
  const prefix = randomIndex(prefixes);
  const adjective = randomIndex(adjectives);
  const noun = randomIndex(nouns);
  return `${prefix}${adjective}${noun}`;
};
