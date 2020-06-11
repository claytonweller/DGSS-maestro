import { IActionElements } from '../../';
import { IMessagePayload } from '../../messager';

export async function trollyQuestionAction(actionElements: IActionElements) {
  const { body, event, messager, sockets } = actionElements;
  const { performance_id, options }: { performance_id: number; options: IQuestionOptions } = body.params;
  console.warn(options);

  // Get all connections.
  // Update Module state with question displayed
  // Update interactions with every user giving the default value

  // If open for choices
  // send message to everyone

  // if timer
  // Wait until timer is done
  // send message ending responses to everyone

  // Check module state for finish state
  // If finish returns a flag saying there should be no more questions
  // if not finish returns flag saying we should move to the next question.

  const payload: IMessagePayload = {
    action: 'trolly-show-question',
    params: {},
  };
  await messager.sendToAll({ performance_id, event, payload }, sockets);
}

interface IQuestionOptions {
  name: string;
  timer?: number;
  openForChoices: boolean;
}
