import { IActionElements } from '../../';
import { Connection, Module, Interaction } from '../../../../db';
import { IMessagePayload } from '../../messager';

export async function bootcampMetricAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id } = body.params;
  const [modules, connections] = await Promise.all([
    Module.getByParam({ title: 'preshow' }),
    Connection.getBySource(['control', 'display'], performance_id),
  ]);

  const module_id = modules[0].id;
  const interactions = await Interaction.getByParam({ performance_id, module_id });
  const params = Math.random() > 0.5 ? multipleChoiceOutput(interactions) : numberOutput(interactions);

  const payload: IMessagePayload = {
    action: 'bootcamp-metric',
    params,
  };
  const ids = connections.map((c) => c.aws_connection_id);
  await messager.sendToIds({ ids, event, payload }, sockets);
}

// Diferent types of questions and how we can aggregate them

const multipleChoiceOutput = (interactions) => {
  const choiceInteractions = filterInteractionssByType(interactions, 'multiple-choice');
  const selected = selectRandomInteraction(choiceInteractions);

  // Creates ann object with the selected prompt and totals for all the answers
  const accumulator = { type: 'multiple-choice', prompt: selected.prompt, answers: {} };

  return choiceInteractions.reduce((a, c) => {
    // Filter out the interaction not related to the prompt
    const { response } = c.data;
    if (c.prompt !== a.prompt) return a;
    // Tally the response
    if (!a.answers[response]) a.answers[response] = 0;
    a.answers[response] += 1;
    return a;
  }, accumulator);
};

const numberOutput = (interactions) => {
  const numberInteractions = filterInteractionssByType(interactions, 'number');
  const selected = selectRandomInteraction(numberInteractions);
  const accumulator = {
    type: 'number',
    prompt: selected.prompt,
    total: 0,
    lowest: {
      attendee: '',
      value: 100000,
    },
    highest: {
      attendee: '',
      value: 0,
    },
    values: [],
  };

  return numberInteractions.reduce((a, n) => {
    const { response } = n.data;
    if (n.prompt !== a.prompt) return a;
    const number = parseInt(response, 10);
    return {
      ...accumulator,
      total: a.total + number,
      lowest: a.lowest.value < number ? a.lowest : { attendee: n.attendee_name, value: number },
      highest: a.highest.value > number ? a.highest : { attendee: n.attendee_name, value: number },
      values: [...a.values, number],
    };
  }, accumulator);
};

const filterInteractionssByType = (interactions, type) => {
  return interactions.filter((int) => {
    const { question } = int.data;
    if (!question || int.data.response === '-skip-') return false;
    return question.responseType === type;
  });
};

const selectRandomInteraction = (interactions) => {
  return interactions[Math.floor(Math.random() * interactions.length)];
};
