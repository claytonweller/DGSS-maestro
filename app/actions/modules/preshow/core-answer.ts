import { IActionElements } from '../..';
import { Interaction, Attendee, Connection } from '../../../../db';
import { IMessagePayload } from '../../messager';
import { chooseNextQuestion } from '.';
import { IInteractionParams } from '../../../../db/interactions';

export async function preshowCoreAnswerAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const data = JSON.parse(body.params.data);

  const interactionParams: IInteractionParams = {
    ...body.params,
    response: data.response,
    prompt: data.question.text,
  };
  if (data.question.column === 'name') {
    const name = data.response;
    interactionParams.attendee_name = name;
    interactionParams.response = name;
  }
  const [otherClients, interaction, attendee] = await Promise.all([
    Connection.getBySource(['display', 'control'], body.params.performance_id),
    Interaction.create(interactionParams),
    Attendee.update(body.params.attendee_id, {
      [data.question.column]: data.response,
    }),
  ]);

  const nextQuestion = chooseNextQuestion(data.answered);
  const crowdPayload: IMessagePayload = {
    action: 'preshow-next-question',
    params: {
      answered: data.answered,
      question: nextQuestion,
      attendee,
    },
  };

  const dataPayload: IMessagePayload = {
    action: 'preshow-answer',
    params: {
      data,
      interaction,
    },
  };
  const ids = otherClients.map((con) => con.aws_connection_id);
  await Promise.all([
    messager.sendToSender({ event, payload: crowdPayload }, sockets),
    messager.sendToIds({ event, payload: dataPayload, ids }, sockets),
  ]);
}
