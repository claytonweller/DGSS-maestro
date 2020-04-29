import { IActionElements } from "../..";
import { Interaction, Connection } from "../../../../db";
import { IMessagePayload } from "../../messager";

export async function preshowTrivialAnswerAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  // const data = JSON.parse(body.params.data)

  const res = await Promise.all([
    Interaction.create(body.params),
    Connection.getBySource(['display', 'control'], body.params.performance_id)
  ])
  console.warn(res)
  const payload: IMessagePayload = {
    action: 'preshow-next-question',
    params: {
      question: {
        core: false,
        text: 'Dogs?',
        responseType: 'text',
        buttonText: 'woof'
      }
    }
  }

  // const resPayload: IMessagePayload = {
  //   action: 'preshow-answer',
  //   params: {
  //     question: {

  //     },

  //   }
  // }

  const ids = res[1].map(con => con.aws_connection_id)
  await Promise.all([
    messager.sendToSender({ event, payload }, sockets),
    messager.sendToIds({ event, payload, ids }, sockets)
  ])
}