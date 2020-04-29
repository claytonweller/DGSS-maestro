import { IActionElements } from "../..";
import { Interaction, Attendee, Connection } from "../../../../db";
import { IMessagePayload } from "../../messager";
import { chooseNextQuestion } from ".";

export async function preshowCoreAnswerAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const data = JSON.parse(body.params.data);

  const [attendee, otherClients] = await Promise.all([
    Attendee.update(body.params.attendee_id, {
      [data.question.column]: data.response,
    }),
    Connection.getBySource(["display", "control"], body.params.performance_id),
    Interaction.create(body.params),
  ]);

  const nextQuestion = chooseNextQuestion(data.answered);
  const crowdPayload: IMessagePayload = {
    action: "preshow-next-question",
    params: {
      answered: data.answered,
      question: nextQuestion,
    },
  };

  const dataPayload: IMessagePayload = {
    action: "preshow-answer",
    params: {
      data,
      attendee,
    },
  };
  const ids = otherClients.map((con) => con.aws_connection_id);
  await Promise.all([
    messager.sendToSender({ event, payload: crowdPayload }, sockets),
    messager.sendToIds({ event, payload: dataPayload, ids }, sockets),
  ]);
}
