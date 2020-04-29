import { IActionElements } from "../../";
import { Interaction } from "../../../../db";
import { IMessagePayload } from "../../messager";
import { initializeAnswered } from "./index";

export async function preshowAcknowledgeAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements
  await Interaction.create(body.params)
  const payload: IMessagePayload = {
    action: 'preshow-next-question',
    params: {
      answered: initializeAnswered(),
      question: {
        core: true,
        column: 'name',
        text: 'What name do you want to use tonight?',
        responseType: 'text',
        buttonText: 'Call Me That'
      }
    }
  }
  console.warn(payload)
  await messager.sendToSender({ event, payload }, sockets)
}