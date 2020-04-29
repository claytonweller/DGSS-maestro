import { IActionElements } from "../..";
import { Interaction, Attendee, Connection } from "../../../../db";
import { IMessagePayload } from "../../messager";
import { chooseNextQuestion } from ".";

export async function preshowCoreAnswerAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  const data = JSON.parse(body.params.data)

  const res = await Promise.all([
    Interaction.create(body.params),
    Attendee.update(
      body.params.attendee_id,
      {
        [data.question.column]: data.response
      }
    ),
    Connection.getBySource(['display', 'control'], body.params.performance_id)
  ])
  const nextQuestion = chooseNextQuestion(data.answered)
  console.warn('OUTSIDE', data.answered)
  const payload: IMessagePayload = {
    action: 'preshow-next-question',
    params: {
      ansered: data.answered,
      question: nextQuestion
    }
  }

  // const resPayload: IMessagePayload = {
  //   action: 'preshow-answer',
  //   params: {
  //     question: {

  //     },

  //   }
  // }

  const ids = res[2].map(con => con.aws_connection_id)
  await Promise.all([
    messager.sendToSender({ event, payload }, sockets),
    messager.sendToIds({ event, payload, ids }, sockets)
  ])
}