import { IActionElements } from "../..";
import { Interaction, Connection } from "../../../../db";
import { IMessagePayload } from "../../messager";
import { chooseNextQuestion } from "./";

export async function preshowTrivialAnswerAction(
  actionElements: IActionElements
) {
  const { body, event, messager, sockets } = actionElements;
  const data = JSON.parse(body.params.data);

  const res = await Promise.all([
    Interaction.create(body.params),
    Connection.getBySource(["display", "control"], body.params.performance_id),
  ]);

  const nextQuestion = chooseNextQuestion(data.answered);
  const payload: IMessagePayload = {
    action: "preshow-next-question",
    params: {
      answered: data.answered,
      question: nextQuestion,
    },
  };

  // const resPayload: IMessagePayload = {
  //   action: 'preshow-answer',
  //   params: {
  //     question: {

  //     },

  //   }
  // }

  const ids = res[1].map((con) => con.aws_connection_id);
  await Promise.all([
    messager.sendToSender({ event, payload }, sockets),
    messager.sendToIds({ event, payload, ids }, sockets),
  ]);
}
