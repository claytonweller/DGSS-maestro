import { IActionElements } from "../..";
import { Interaction, Connection } from "../../../../db";
import { IMessagePayload } from "../../messager";
import { chooseNextQuestion } from "./";

export async function preshowTrivialAnswerAction(
  actionElements: IActionElements
) {
  const { body, event, messager, sockets } = actionElements;
  const data = JSON.parse(body.params.data);
  const interactionParams = {
    ...body.params,
    response: data.response,
    prompt: data.question.text
  }
  const [interaction, otherConnections] = await Promise.all([
    Interaction.create(interactionParams),
    Connection.getBySource(["display", "control"], body.params.performance_id),
  ]);

  const nextQuestion = chooseNextQuestion(data.answered);
  const userPayload: IMessagePayload = {
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
      interaction
    },
  };

  const ids = otherConnections.map((con) => con.aws_connection_id);
  await Promise.all([
    messager.sendToSender({ event, payload: userPayload }, sockets),
    messager.sendToIds({ event, payload: dataPayload, ids }, sockets),
  ]);
}
